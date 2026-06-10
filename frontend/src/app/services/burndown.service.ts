import { Injectable } from '@angular/core';
import { BurndownData, BurndownDay, BurndownDataMap } from '../models';

@Injectable({ providedIn: 'root' })
export class BurndownService {
  /**
   * Cada entrada en `actual` incluye:
   *   day       — día del sprint (1‑based)
   *   remaining — story points reales restantes al cierre del día
   *   ideal     — story points IDEALES restantes según la línea de tendencia
   */
  private readonly data: BurndownDataMap = {
    sprint0: {
      label: 'Sprint 0',
      totalPoints: 12,
      status: 'Completado',
      color: '#2ecc71',
      achievement: 'Planificación inicial completada al 100%',
      description:
        'En el Sprint 0 se logró completar toda la planificación del proyecto. El equipo se mantuvo siempre cerca o por debajo de la línea ideal, cerrando el sprint sin deuda técnica. La configuración del repositorio, el análisis de la arquitectura FreeCAD y la definición de historias de usuario se completaron según lo planificado.',
      actual: this.computeActualWithIdeal(
        [
          { day: 1, remaining: 12 },
          { day: 2, remaining: 12 },
          { day: 3, remaining: 12 },
          { day: 4, remaining: 12 },
          { day: 5, remaining: 10 },
          { day: 6, remaining: 10 },
          { day: 7, remaining: 8 },
          { day: 8, remaining: 7 },
          { day: 9, remaining: 5 },
          { day: 10, remaining: 3 },
          { day: 11, remaining: 2 },
          { day: 12, remaining: 0 },
        ],
        12,
      ),
    },
    sprint1: {
      label: 'Sprint 1',
      totalPoints: 20,
      status: 'Completado',
      color: '#2ecc71',
      achievement: 'Pipeline CI/CD funcional — 18 de 20 SP completados',
      description:
        'Durante el Sprint 1, el equipo completó la mayoría de los objetivos planificados. Se logró configurar GitHub Pages, el pipeline CI/CD con Actions, y el dashboard del proyecto. Sin embargo, los tests automatizados y la documentación completa del pipeline quedaron pendientes para sprints futuros.',
      actual: this.computeActualWithIdeal(
        [
          { day: 1, remaining: 20 },
          { day: 2, remaining: 20 },
          { day: 3, remaining: 20 },
          { day: 4, remaining: 18 },
          { day: 5, remaining: 16 },
          { day: 6, remaining: 14 },
          { day: 7, remaining: 12 },
          { day: 8, remaining: 10 },
          { day: 9, remaining: 8 },
          { day: 10, remaining: 6 },
          { day: 11, remaining: 4 },
          { day: 12, remaining: 2 },
          { day: 13, remaining: 2 },
          { day: 14, remaining: 0 },
        ],
        20,
      ),
    },
    sprint2: {
      label: 'Sprint 2',
      totalPoints: 25,
      status: 'En progreso',
      color: '#3498db',
      achievement:
        'Mejoras en el equipo: Mayor coordinación en daily standups, integración temprana de módulos BIM y mejores prácticas de code review establecidas. 15/25 story points completados al día 7.',
      description:
        'Sprint de BIM y Herramientas Paramétricas. Estamos implementando las funcionalidades del módulo BIM de FreeCAD y desarrollando herramientas paramétricas con restricciones en Part. Se están realizando pruebas de integración entre los módulos BIM y las herramientas existentes. Es el sprint más intenso del proyecto en términos de desarrollo técnico.',
      actual: [
        { day: 1, remaining: 25, ideal: 25 },
        { day: 2, remaining: 23, ideal: 20.83 },
        { day: 3, remaining: 20, ideal: 16.66 },
        { day: 4, remaining: 18, ideal: 12.5 },
        { day: 5, remaining: 15, ideal: 8.33 },
        { day: 6, remaining: 12.5, ideal: 4.16 },
        { day: 7, remaining: 10, ideal: 0 },
      ],
    },
    sprint3: {
      label: 'Sprint 3',
      totalPoints: 15,
      status: 'Pendiente',
      color: '#95a5a6',
      achievement: 'Pendiente de inicio',
      description:
        'Sprint planificado para refactorización, pruebas de integración y documentación técnica final. Los datos de burndown estarán disponibles una vez que el sprint esté en curso.',
      actual: [],
    },
  };

  /** Añade el campo `ideal` a cada día de una serie real.
   *  ideal(d) = totalPoints * (1 - (d-1)/(n-1))
   *  → empieza en totalPoints el día 1, llega a 0 el día n */
  private computeActualWithIdeal(actual: BurndownDay[], totalPoints: number): BurndownDay[] {
    const n = actual.length;
    return actual.map((d, i) => ({
      ...d,
      ideal: n > 1 ? Math.round(totalPoints * (1 - i / (n - 1)) * 100) / 100 : totalPoints,
    }));
  }

  getBurndown(sprintKey: string): BurndownData | null {
    return this.data[sprintKey] ?? null;
  }

  getAllBurndowns(): BurndownDataMap {
    return { ...this.data };
  }

  getAvailableSprints(): string[] {
    return Object.keys(this.data);
  }

  /** Genera la línea ideal SVG path dados los puntos del dataset.
   *  Usa `ideal` de cada punto si existe, si no usa `generateIdealPoints`. */
  getIdealPoints(data: BurndownData): { day: number; ideal: number }[] {
    if (data.actual.length === 0) return [];
    // Si algún punto ya tiene ideal, usamos los ideales del dataset
    if (data.actual[0]?.ideal !== undefined) {
      return data.actual.map((d) => ({ day: d.day, ideal: d.ideal! }));
    }
    // Sino, generamos línea ideal lineal
    return this.generateIdealPoints(data.totalPoints, data.actual.length);
  }

  /** Genera una línea ideal lineal: totalPoints → 0 en n días. */
  generateIdealPoints(totalPoints: number, totalDays: number): { day: number; ideal: number }[] {
    if (totalDays <= 1) return [{ day: 1, ideal: totalPoints }];
    return Array.from({ length: totalDays }, (_, i) => ({
      day: i + 1,
      ideal: Math.round(totalPoints * (1 - i / (totalDays - 1)) * 100) / 100,
    }));
  }

  /** SVG path para la línea ideal (basada en puntos ideales) */
  getIdealLinePath(
    idealPoints: { day: number; ideal: number }[],
    chartWidth: number,
    chartHeight: number,
    totalPoints: number,
  ): string {
    const maxDay = idealPoints.length;
    if (maxDay === 0) return '';
    return idealPoints
      .map((p, i) => {
        const x = ((i) / (maxDay - 1)) * chartWidth;
        const y = chartHeight - (p.ideal / totalPoints) * chartHeight;
        return `${i === 0 ? 'M' : 'L'}${x},${y}`;
      })
      .join(' ');
  }

  /** SVG path para la línea real (basada en remaining real) */
  getActualLinePath(
    actual: BurndownDay[],
    totalPoints: number,
    chartWidth: number,
    chartHeight: number,
  ): string {
    const maxDay = actual.length;
    if (maxDay === 0) return '';
    return actual
      .map((p, i) => {
        const x = (i / (maxDay - 1)) * chartWidth;
        const y = chartHeight - (p.remaining / totalPoints) * chartHeight;
        return `${i === 0 ? 'M' : 'L'}${x},${y}`;
      })
      .join(' ');
  }
}
