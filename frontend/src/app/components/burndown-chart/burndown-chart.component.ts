import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BurndownService } from '../../services/burndown.service';
import { SprintService } from '../../services/sprint.service';
import { BurndownData, BurndownDay } from '../../models';
import { Sprint } from '../../models';

interface DotPoint {
  cx: number;
  cy: number;
}

interface StatItem {
  value: string;
  label: string;
  color: string;
}

@Component({
  selector: 'app-burndown-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './burndown-chart.component.html',
  styleUrl: './burndown-chart.component.css',
})
export class BurndownChartComponent {
  /** Expuesto al template para usar Math.round() etc. */
  readonly Math = Math;

  private burndownService = inject(BurndownService);
  private sprintService = inject(SprintService);

  readonly selectedSprintKey = this.sprintService.selectedSprintKey;
  readonly sprints = this.sprintService.sprints;

  // ── Dimensiones del SVG ──
  readonly chartWidth = 620;
  readonly chartHeight = 230;
  readonly padding = 38;

  // ── Datos ──
  readonly burndownData = computed(() => {
    const key = this.selectedSprintKey();
    return this.burndownService.getBurndown(key);
  });

  readonly innerW = computed(() => this.chartWidth - this.padding * 2);
  readonly innerH = computed(() => this.chartHeight - this.padding * 2);

  readonly maxDay = computed(() => {
    const data = this.burndownData();
    return data?.actual.length ?? 0;
  });

  // ── Línea Ideal ──
  readonly idealPoints = computed(() => {
    const data = this.burndownData();
    if (!data) return [];
    return this.burndownService.getIdealPoints(data);
  });

  readonly idealLine = computed(() => {
    const data = this.burndownData();
    const pts = this.idealPoints();
    if (!data || pts.length === 0) return '';
    return this.burndownService.getIdealLinePath(pts, this.innerW(), this.innerH(), data.totalPoints);
  });

  // ── Línea Real ──
  readonly actualLine = computed(() => {
    const data = this.burndownData();
    if (!data) return '';
    return this.burndownService.getActualLinePath(data.actual, data.totalPoints, this.innerW(), this.innerH());
  });

  readonly viewBox = computed(() => `0 0 ${this.chartWidth} ${this.chartHeight}`);
  readonly transformAttr = computed(() => `translate(${this.padding}, ${this.padding})`);
  readonly legendTransform = computed(() => `translate(${this.chartWidth - this.padding - 140}, ${this.padding + 4})`);

  /** Posición del label "Story Points" rotado en el eje Y */
  readonly yLabelTransform = computed(() => {
    const cx = this.padding - 32;
    const cy = this.padding + this.innerH() / 2;
    return `rotate(-90, ${cx}, ${cy})`;
  });

  // ── Eje Y — ticks específicos ──
  readonly yLabels = computed(() => {
    const data = this.burndownData();
    if (!data) return [];
    const total = data.totalPoints;

    // Para 25 puntos usamos los valores exactos del diseño
    // Para otros valores generamos ticks "limpios"
    let values: number[];
    if (total === 25) {
      values = [25, 19, 13, 6, 0];
    } else {
      const steps = 5;
      const interval = Math.ceil(total / steps);
      values = [];
      for (let i = 0; i <= steps; i++) {
        values.push(interval * (steps - i));
      }
    }

    return values.map((v) => ({
      value: v,
      y: this.padding + this.innerH() - (v / total) * this.innerH(),
    }));
  });

  // ── Eje X — todos los días ──
  readonly xLabels = computed(() => {
    const n = this.maxDay();
    if (n === 0) return [];
    return Array.from({ length: n }, (_, i) => ({
      day: i + 1,
      x: this.padding + (i / (n - 1)) * this.innerW(),
    }));
  });

  // ── Puntos del gráfico (dots) ──
  readonly dataDots = computed<DotPoint[]>(() => {
    const data = this.burndownData();
    if (!data) return [];
    const n = data.actual.length;
    if (n === 0) return [];
    return data.actual.map((pt, i) => ({
      cx: this.padding + (i / (n - 1)) * this.innerW(),
      cy: this.padding + this.innerH() - (pt.remaining / data.totalPoints) * this.innerH(),
    }));
  });

  // ── Último punto (para etiqueta "N pt") ──
  readonly lastDataPoint = computed<BurndownDay | null>(() => {
    const data = this.burndownData();
    if (!data || data.actual.length === 0) return null;
    return data.actual[data.actual.length - 1];
  });

  readonly lastDotPos = computed<DotPoint | null>(() => {
    const dots = this.dataDots();
    if (dots.length === 0) return null;
    return dots[dots.length - 1];
  });

  // ── Stats grid ──
  readonly stats = computed<StatItem[]>(() => {
    const data = this.burndownData();
    if (!data) return [];
    const lastRemaining = data.actual.length > 0 ? data.actual[data.actual.length - 1].remaining : data.totalPoints;
    const completed = data.totalPoints - lastRemaining;
    const progress = data.totalPoints > 0 ? Math.round((completed / data.totalPoints) * 100) : 0;

    return [
      { value: String(Math.round(lastRemaining)), label: 'Puntos Restantes', color: '#0f172a' },
      { value: String(Math.round(completed)), label: 'Completados', color: '#16a34a' },
      { value: progress + '%', label: 'Progreso', color: '#2563eb' },
      { value: data.status === 'En progreso' ? 'En Curso' : data.status, label: 'Estado Sprint', color: '#f59e0b' },
    ];
  });

  // ── Label del sprint (para insight box) ──
  readonly sprintLabel = computed(() => {
    const sprint = this.sprintService.sprints().find((s) => s.key === this.selectedSprintKey());
    return sprint?.description.split('.')[0] ?? '';
  });

  // ── Cuerpo del insight: descripción sin la primera oración ──
  readonly insightBody = computed(() => {
    const data = this.burndownData();
    if (!data) return '';
    const dotIdx = data.description.indexOf('.');
    if (dotIdx === -1 || dotIdx === data.description.length - 1) return '';
    return data.description.slice(dotIdx + 1).trim();
  });

  // ── Configuración dinámica del bloque de logros ──
  readonly achievementConfig = computed<{ emoji: string; accentColor: string }>(() => {
    const data = this.burndownData();
    const status = data?.status ?? '';
    if (status === 'Completado') {
      return { emoji: '🏆', accentColor: '#16a34a' };    // verde = logro cumplido
    }
    if (status === 'En progreso') {
      return { emoji: '🔧', accentColor: '#f59e0b' };    // naranja = en desarrollo
    }
    return { emoji: '⏳', accentColor: '#94a3b8' };        // gris = pendiente
  });

  // ── Métodos públicos ──

  getAvailableSprints(): string[] {
    return this.burndownService.getAvailableSprints();
  }

  getBurndown(key: string): BurndownData | null {
    return this.burndownService.getBurndown(key);
  }

  getSprintStatus(key: string): string {
    const sprint = this.sprintService.sprints().find((s) => s.key === key);
    return sprint?.status ?? 'pending';
  }

  getSprint(key: string): Sprint | undefined {
    return this.sprintService.sprints().find((s) => s.key === key);
  }

  selectSprint(key: string): void {
    this.sprintService.selectSprint(key);
  }
}
