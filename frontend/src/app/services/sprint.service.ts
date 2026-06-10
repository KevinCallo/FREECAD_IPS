import { Injectable, signal, computed } from '@angular/core';
import { Sprint, MetricSummary, SprintGoal, SprintBacklogItem } from '../models';

@Injectable({ providedIn: 'root' })
export class SprintService {
  private readonly SPRINTS_DATA: Sprint[] = [
    {
      key: 'sprint0',
      label: 'Sprint 0',
      start: new Date(2026, 4, 1),
      end: new Date(2026, 4, 13),
      status: 'done',
      storyPoints: 12,
      description:
        'Planificación, análisis del sistema FreeCAD (OpenCASCADE, Coin3D, Qt), configuración del repositorio y GitHub Projects.',
      goals: [
        {
          icon: 'fa-server',
          title: 'Infraestructura',
          description: 'Configuración del repositorio GitHub, Git Pages y Projects board.',
          status: 'done',
        },
        {
          icon: 'fa-magnifying-glass-chart',
          title: 'Análisis',
          description: 'Análisis de arquitectura FreeCAD: OpenCASCADE, Coin3D, Qt, Python.',
          status: 'done',
        },
        {
          icon: 'fa-clipboard',
          title: 'Planificación',
          description: 'Definición de historias de usuario, épicas y roadmap del proyecto.',
          status: 'done',
        },
      ],
      backlog: [
        { title: 'Configurar repositorio GitHub y ramas', done: true },
        { title: 'Analizar arquitectura FreeCAD (OpenCASCADE, Coin3D, Qt)', done: true },
        { title: 'Configurar GitHub Projects con columnas Kanban', done: true },
        { title: 'Definir historias de usuario del proyecto', done: true },
        { title: 'Crear planificación inicial y épicas', done: true },
      ],
      progress: 100,
    },
    {
      key: 'sprint1',
      label: 'Sprint 1',
      start: new Date(2026, 4, 14),
      end: new Date(2026, 4, 28),
      status: 'done',
      storyPoints: 20,
      description:
        'Desarrollo del pipeline CI/CD con GitHub Actions, prototipos funcionales e integración continua.',
      goals: [
        {
          icon: 'fa-gears',
          title: 'CI/CD Pipeline',
          description: 'Configurar GitHub Actions con integración continua y despliegue automático a Pages.',
          status: 'done',
        },
        {
          icon: 'fa-cube',
          title: 'Prototipado',
          description: 'Primeros prototipos funcionales de módulos paramétricos en FreeCAD.',
          status: 'done',
        },
        {
          icon: 'fa-vial',
          title: 'Pruebas Iniciales',
          description: 'Plan de pruebas unitarias y validación del pipeline.',
          status: 'pending',
        },
      ],
      backlog: [
        { title: 'Crear repositorio y configurar GitHub Pages', done: true },
        { title: 'Configurar GitHub Actions para CI/CD', done: true },
        { title: 'Diseñar dashboard del proyecto (actual)', done: true },
        { title: 'Implementar tests automatizados', done: false },
        { title: 'Documentar pipeline DevOps', done: false },
      ],
      progress: 100,
    },
    {
      key: 'sprint2',
      label: 'Sprint 2',
      start: new Date(2026, 4, 29),
      end: new Date(2026, 5, 10),
      status: 'active',
      storyPoints: 25,
      description:
        'Implementación de funcionalidades del módulo BIM de FreeCAD, desarrollo de herramientas paramétricas y pruebas de integración.',
      goals: [
        {
          icon: 'fa-building',
          title: 'Módulo BIM',
          description: 'Implementación de funcionalidades del módulo BIM de FreeCAD.',
          status: 'active',
        },
        {
          icon: 'fa-cubes',
          title: 'Paramétricas',
          description: 'Desarrollo de herramientas paramétricas y restricciones en Part.',
          status: 'active',
        },
        {
          icon: 'fa-vial',
          title: 'Integración',
          description: 'Pruebas de integración entre módulos BIM y herramientas existentes.',
          status: 'pending',
        },
      ],
      backlog: [
        { title: 'Setup del entorno de desarrollo BIM', done: true },
        { title: 'Implementar funcionalidades BIM', done: false },
        { title: 'Desarrollar herramientas paramétricas Part', done: false },
        { title: 'Pruebas de integración módulo BIM', done: false },
        { title: 'Documentación de módulos BIM', done: false },
      ],
      progress: 0,
    },
    {
      key: 'sprint3',
      label: 'Sprint 3',
      start: new Date(2026, 5, 11),
      end: new Date(2026, 5, 25),
      status: 'pending',
      storyPoints: 15,
      description:
        'Optimización del código, refactorización de módulos existentes, pruebas de integración y documentación técnica final.',
      goals: [
        {
          icon: 'fa-broom',
          title: 'Refactorización',
          description: 'Refactorización de código BIM y herramientas paramétricas.',
          status: 'pending',
        },
        {
          icon: 'fa-flask',
          title: 'Pruebas',
          description: 'Pruebas de integración completas y validación de rendimiento.',
          status: 'pending',
        },
        {
          icon: 'fa-book',
          title: 'Documentación',
          description: 'Documentación técnica de módulos implementados y manual de arquitectura.',
          status: 'pending',
        },
      ],
      backlog: [
        { title: 'Refactorizar módulo BIM para mejorar rendimiento', done: false },
        { title: 'Pruebas de integración entre todos los módulos', done: false },
        { title: 'Documentación de la arquitectura del sistema', done: false },
        { title: 'Manual de usuario para herramientas paramétricas', done: false },
        { title: 'Presentación final del proyecto', done: false },
      ],
      progress: 0,
    },
  ];

  readonly sprints = signal<Sprint[]>(this.SPRINTS_DATA);

  readonly metrics = computed<MetricSummary>(() => {
    const all = this.sprints();
    return {
      sprintsCompleted: all.filter((s) => s.status === 'done').length,
      activeSprint: all.filter((s) => s.status === 'active').length,
      totalSprints: all.length,
      daysPerSprint: 15,
    };
  });

  readonly activeSprint = computed(() => this.sprints().find((s) => s.status === 'active') ?? null);

  private _selectedSprintKey = signal<string>('sprint2');
  readonly selectedSprintKey = this._selectedSprintKey.asReadonly();

  readonly selectedSprint = computed(() => {
    return this.sprints().find((s) => s.key === this._selectedSprintKey()) ?? null;
  });

  selectSprint(key: string): void {
    if (this.sprints().some((s) => s.key === key)) {
      this._selectedSprintKey.set(key);
    }
  }

  calcSprintProgress(key: string): number {
    const sprint = this.SPRINTS_DATA.find((s) => s.key === key);
    if (!sprint) return 0;
    if (sprint.status === 'done') return 100;
    if (sprint.status === 'pending') return 0;

    const today = new Date();
    const total = Math.round((sprint.end.getTime() - sprint.start.getTime()) / (1000 * 60 * 60 * 24));
    if (today < sprint.start) return 0;
    if (today > sprint.end) return 100;
    const elapsed = Math.round((today.getTime() - sprint.start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  }

  getCurrentSprintKey(): string {
    const today = new Date();
    for (const s of this.SPRINTS_DATA) {
      if (today >= s.start && today <= s.end) return s.key;
    }
    return 'sprint2';
  }

  showToast(message: string, type: 'success' | 'info' | 'warning' = 'info'): void {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const icons = { success: 'fa-check-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `<i class="fa-solid ${icons[type]}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 3000);
  }
}
