import { Component, inject, Input, Output, EventEmitter, signal, AfterViewInit, effect, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { SprintService } from '../../services/sprint.service';
import { Sprint } from '../../models';

/** Un link de navegación dentro de un tipo de documentación */
export interface NavLink {
  id: string;
  label: string;
  icon: string;
  /** Agrupación lógica para separadores visuales en el nav */
  group?: string;
}

/** Configuración de un tipo de documentación para el filtro de docs */
export interface DocsFilterOption {
  key: string;
  label: string;
  labelShort: string;
  icon: string;
  navLinks: NavLink[];
}

/** Opciones del filtro de documentación */
export const DOCS_FILTER_OPTIONS: DocsFilterOption[] = [
  {
    key: 'freecad',
    label: 'FREECAD Documentation',
    labelShort: 'FREECAD',
    icon: 'fa-solid fa-cube',
    navLinks: [
      // General
      { id: 'docs-descripcion', label: '¿Qué es?', icon: 'fa-solid fa-circle-question', group: 'general' },
      { id: 'docs-historia', label: 'Historia', icon: 'fa-solid fa-timeline', group: 'general' },
      // Inicio
      { id: 'fc-instalacion', label: 'Instalación', icon: 'fa-solid fa-download', group: 'start' },
      { id: 'docs-primeros-pasos', label: 'Primeros Pasos', icon: 'fa-solid fa-graduation-cap', group: 'start' },
      // Interfaz
      { id: 'fc-interfaz', label: 'Interfaz', icon: 'fa-solid fa-desktop', group: 'ui' },
      { id: 'docs-navegacion', label: 'Navegación', icon: 'fa-solid fa-compass', group: 'ui' },
      // Formatos
      { id: 'fc-formatos', label: 'Formatos', icon: 'fa-solid fa-file-export', group: 'formats' },
      // Técnico
      { id: 'fc-arquitectura', label: 'Arquitectura', icon: 'fa-solid fa-sitemap', group: 'tech' },
      { id: 'fc-modulos', label: 'Módulos', icon: 'fa-regular fa-folder-open', group: 'tech' },
      { id: 'docs-macros', label: 'Macros', icon: 'fa-solid fa-terminal', group: 'tech' },
      // Metodología
      { id: 'docs-comparacion', label: 'Waterfall vs Scrum', icon: 'fa-solid fa-scale-balanced', group: 'methodology' },
      { id: 'docs-faq', label: 'FAQ', icon: 'fa-solid fa-question', group: 'methodology' },
    ],
  },
  {
    key: 'product-owner',
    label: 'Product Owner Documentation',
    labelShort: 'Product Owner',
    icon: 'fa-solid fa-clipboard',
    navLinks: [
      { id: 'fc-product-backlog', label: 'Backlog', icon: 'fa-solid fa-list-check', group: 'backlog' },
      { id: 'fc-detalles-backlog', label: 'Detalle', icon: 'fa-solid fa-circle-info', group: 'backlog' },
      { id: 'po-sprints', label: 'Distribución', icon: 'fa-solid fa-rotate', group: 'sprints' },
      { id: 'po-evolucion', label: 'Evolución', icon: 'fa-solid fa-arrow-trend-up', group: 'sprints' },
    ],
  },
  {
    key: 'scrum-master',
    label: 'Scrum Master Documentation',
    labelShort: 'Scrum Master',
    icon: 'fa-solid fa-users-gear',
    navLinks: [
      { id: 'sm-rol', label: 'Rol del SM', icon: 'fa-solid fa-user-tie', group: 'role' },
      { id: 'sm-ceremonias', label: 'Ceremonias', icon: 'fa-solid fa-calendar-check', group: 'role' },
      { id: 'sm-artefactos', label: 'Artefactos', icon: 'fa-solid fa-clipboard-list', group: 'artifacts' },
      { id: 'sm-dod', label: 'DoD', icon: 'fa-solid fa-check-double', group: 'artifacts' },
      { id: 'sm-gestion', label: 'Gestión', icon: 'fa-solid fa-chart-line', group: 'artifacts' },
    ],
  },
  {
    key: 'devops',
    label: 'DevOps Documentation (CI/CD)',
    labelShort: 'DevOps CI/CD',
    icon: 'fa-solid fa-gears',
    navLinks: [
      // Filosofía
      { id: 'fc-devops-core', label: 'Fundamentos', icon: 'fa-solid fa-infinity', group: 'philosophy' },
      { id: 'fc-pipeline-architecture', label: 'Pipeline Arq.', icon: 'fa-solid fa-diagram-project', group: 'philosophy' },
      // Pipeline
      { id: 'devops-pipeline', label: 'CI/CD', icon: 'fa-solid fa-code-branch', group: 'pipeline' },
      { id: 'fc-infrastructure-matrix', label: 'Infraestructura', icon: 'fa-solid fa-server', group: 'pipeline' },
      // Ramas + Calidad
      { id: 'devops-branches', label: 'Ramas', icon: 'fa-solid fa-fork', group: 'quality' },
      { id: 'devops-quality', label: 'Calidad', icon: 'fa-solid fa-shield-halved', group: 'quality' },
      { id: 'devops-deploy', label: 'Despliegue', icon: 'fa-solid fa-rocket', group: 'quality' },
      // Monitoreo
      { id: 'fc-telemetry-system', label: 'Telemetría', icon: 'fa-solid fa-chart-line', group: 'monitoring' },
      { id: 'devops-monitoring', label: 'Monitoreo', icon: 'fa-solid fa-gauge-high', group: 'monitoring' },
      { id: 'fc-devops-advantages', label: 'Ventajas', icon: 'fa-solid fa-star', group: 'monitoring' },
    ],
  },
];

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements AfterViewInit {
  private sprintService = inject(SprintService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private scrollRafId: number | null = null;
  private scrollHandler: ((e: Event) => void) | null = null;

  /** Sección activa dentro de la documentación actual (para resaltar pills) */
  readonly activeDocSection = signal<string>('');

  /** Página actual: 'home' (default), 'diagrams' o 'docs' */
  @Input() page: 'home' | 'diagrams' | 'docs' = 'home';

  /** Filtro activo de diagramas (solo relevante en page='diagrams') */
  @Input() diagramFilter: string = 'all';

  /** Emitido cuando se selecciona un filtro de diagrama */
  @Output() diagramFilterChange = new EventEmitter<string>();

  /** Filtro activo de documentación (solo relevante en page='docs') */
  @Input() docsFilter: string = 'freecad';

  /** Emitido cuando se selecciona un filtro de documentación */
  @Output() docsFilterChange = new EventEmitter<string>();

  /** Opciones de filtro de documentación (expuesto al template) */
  readonly docsFilterOptions = DOCS_FILTER_OPTIONS;

  readonly sprints = this.sprintService.sprints;
  readonly selectedSprintKey = this.sprintService.selectedSprintKey;
  readonly selectedSprint = this.sprintService.selectedSprint;
  readonly activeSprint = this.sprintService.activeSprint;

  sprintMenuOpen = false;
  diagramFilterOpen = false;
  docsFilterOpen = false;

  selectSprint(key: string): void {
    this.sprintService.selectSprint(key);
  }

  toggleSprintMenu(): void {
    this.sprintMenuOpen = !this.sprintMenuOpen;
  }

  closeSprintMenu(): void {
    this.sprintMenuOpen = false;
  }

  toggleDiagramFilter(): void {
    this.diagramFilterOpen = !this.diagramFilterOpen;
  }

  closeDiagramFilter(): void {
    this.diagramFilterOpen = false;
  }

  toggleDocsFilter(): void {
    this.docsFilterOpen = !this.docsFilterOpen;
  }

  closeDocsFilter(): void {
    this.docsFilterOpen = false;
  }

  setDiagramFilter(key: string): void {
    this.diagramFilterChange.emit(key);
  }

  setDocsFilter(key: string): void {
    this.docsFilterChange.emit(key);
  }

  getFilterSprint(): Sprint | undefined {
    return this.sprints().find((s) => s.key === this.diagramFilter);
  }

  getActiveDocsOption(): DocsFilterOption | undefined {
    return DOCS_FILTER_OPTIONS.find((o) => o.key === this.docsFilter);
  }

  ngAfterViewInit(): void {
    this.initScrollDetection();

    // Re-ejecutar la detección cuando cambie el filtro de documentación
    effect(() => {
      // Leer docsFilter para que effect lo trackee como dependencia
      const _ = this.docsFilter;
      // Dar tiempo a que los nuevos elementos se rendericen
      setTimeout(() => this.updateActiveSection(), 100);
    });
  }

  scrollTo(id: string): void {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    this.sprintMenuOpen = false;
  }

  // ── Scroll-based active section detection ──────────────────────

  /** Inicializa el listener de scroll para detectar la sección activa */
  private initScrollDetection(): void {
    this.scrollHandler = () => {
      if (this.scrollRafId !== null) return;
      this.scrollRafId = requestAnimationFrame(() => {
        this.updateActiveSection();
        this.scrollRafId = null;
      });
    };

    window.addEventListener('scroll', this.scrollHandler, { passive: true });

    // Limpiar al destruir
    this.destroyRef.onDestroy(() => {
      if (this.scrollHandler) {
        window.removeEventListener('scroll', this.scrollHandler);
      }
      if (this.scrollRafId !== null) {
        cancelAnimationFrame(this.scrollRafId);
      }
    });

    // Detección inicial
    setTimeout(() => this.updateActiveSection(), 150);
  }

  /**
   * Activa la sección cuyo centro esté más cercano al centro del viewport.
   *
   * Esto es mucho más intuitivo que los enfoques anteriores:
   * - El pill cambia CUANDO la sección se vuelve predominante en pantalla
   * - Funciona IDÉNTICO scrolleando hacia arriba o hacia abajo
   * - No se "traba" con valores mínimos como el algoritmo anterior
   */
  private updateActiveSection(): void {
    const links = this.getActiveDocsOption()?.navLinks ?? [];
    if (links.length === 0) return;

    const viewportCenter = window.innerHeight / 2;
    let bestId = links[0].id;
    let bestDist = Infinity;

    for (const link of links) {
      const el = document.getElementById(link.id);
      if (el) {
        const rect = el.getBoundingClientRect();
        const sectionCenter = (rect.top + rect.bottom) / 2;
        const distance = Math.abs(sectionCenter - viewportCenter);
        if (distance < bestDist) {
          bestDist = distance;
          bestId = link.id;
        }
      }
    }

    this.activeDocSection.set(bestId);
  }

  goToDiagrams(): void {
    this.router.navigate(['/diagrams']);
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }
}
