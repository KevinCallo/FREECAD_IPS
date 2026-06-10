import { Injectable, signal } from '@angular/core';
import { SprintBoard, SprintBoards, KanbanTask, TASK_TYPES } from '../models';

const STORAGE_KEY = 'fc_kanban_boards';

const DEFAULT_BOARDS: SprintBoards = {
  sprint0: {
    label: 'Sprint 0',
    icon: 'fa-check-circle',
    'product-backlog': [],
    'sprint-backlog': [],
    inprogress: [],
    review: [],
    done: [
      { id: 's0-1', title: 'Configuración del repositorio GitHub', assignee: 'KevinCallo', tag: 'task', tagColor: '#95a5a6' },
      { id: 's0-2', title: 'Análisis de arquitectura FreeCAD (OpenCASCADE, Coin3D, Qt)', assignee: 'Equipo', tag: 'research', tagColor: '#3498db' },
      { id: 's0-3', title: 'Configuración de GitHub Projects', assignee: 'KevinCallo, darich1010', tag: 'feature', tagColor: '#f39c12' },
      { id: 's0-4', title: 'Planificación inicial del proyecto', assignee: 'Andhyb', tag: 'task', tagColor: '#95a5a6' },
      { id: 's0-5', title: 'Definición de historias de usuario', assignee: 'Equipo', tag: 'docs', tagColor: '#8e44ad' },
    ],
  },
  sprint1: {
    label: 'Sprint 1',
    icon: 'fa-check-circle',
    'product-backlog': [
      { id: 's1-6', title: 'Schedule planning', assignee: 'Andhyb', tag: 'task', tagColor: '#95a5a6' },
      { id: 's1-7', title: 'Documentación técnica inicial', assignee: 'Equipo', tag: 'docs', tagColor: '#8e44ad' },
    ],
    'sprint-backlog': [],
    inprogress: [],
    review: [],
    done: [
      { id: 's1-1', title: 'Creación de GitHub Pages', assignee: 'KevinCallo, darich1010', tag: 'feature', tagColor: '#f39c12' },
      { id: 's1-2', title: 'Configuración de GitHub Actions CI/CD', assignee: 'PauloQuen', tag: 'feature', tagColor: '#f39c12' },
      { id: 's1-3', title: 'Dashboard del proyecto v1', assignee: 'mathiasddf, PauloQuen', tag: 'feature', tagColor: '#f39c12' },
      { id: 's1-4', title: 'Testing de Issues & Actions', assignee: 'mathiasddf, PauloQuen', tag: 'task', tagColor: '#95a5a6' },
      { id: 's1-5', title: 'Pipeline CI/CD funcional', assignee: 'PauloQuen', tag: 'feature', tagColor: '#f39c12' },
    ],
  },
  sprint2: {
    label: 'Sprint 2',
    icon: 'fa-bolt',
    'product-backlog': [
      { id: 's2-1', title: 'Investigación de restricciones paramétricas', assignee: 'PauloQuen', tag: 'research', tagColor: '#3498db' },
    ],
    'sprint-backlog': [
      { id: 's2-2', title: 'Pruebas de integración módulo BIM', assignee: 'darich1010', tag: 'bug', tagColor: '#e74c3c' },
      { id: 's2-3', title: 'Documentación de módulos BIM', assignee: 'Equipo', tag: 'docs', tagColor: '#8e44ad' },
    ],
    inprogress: [
      { id: 's2-4', title: 'Implementación de funcionalidades BIM', assignee: 'mathiasddf', tag: 'feature', tagColor: '#f39c12' },
      { id: 's2-5', title: 'Herramientas paramétricas Part', assignee: 'KevinCallo', tag: 'feature', tagColor: '#f39c12' },
    ],
    review: [],
    done: [
      { id: 's2-6', title: 'Setup del entorno de desarrollo BIM', assignee: 'KevinCallo', tag: 'task', tagColor: '#95a5a6' },
    ],
  },
  sprint3: {
    label: 'Sprint 3',
    icon: 'fa-book',
    'product-backlog': [
      { id: 's3-1', title: 'Deuda técnica del módulo BIM', assignee: 'KevinCallo', tag: 'bug', tagColor: '#e74c3c' },
      { id: 's3-2', title: 'Optimización de consultas paramétricas', assignee: 'PauloQuen', tag: 'research', tagColor: '#3498db' },
    ],
    'sprint-backlog': [
      { id: 's3-3', title: 'Refactorización de herramientas paramétricas', assignee: 'mathiasddf', tag: 'feature', tagColor: '#f39c12' },
      { id: 's3-4', title: 'Pruebas de integración completas', assignee: 'darich1010', tag: 'task', tagColor: '#95a5a6' },
    ],
    inprogress: [],
    review: [],
    done: [],
  },
};

@Injectable({ providedIn: 'root' })
export class KanbanService {
  readonly boards$ = signal<SprintBoards>(this.loadBoards()).asReadonly();

  private getAssigneeOptions(): { value: string; label: string }[] {
    return [
      { value: 'Kevin Callo', label: 'Kevin Callo' },
      { value: 'Mathias Davila', label: 'Mathias Davila' },
      { value: 'Paulo Quenta', label: 'Paulo Quenta' },
      { value: 'Dario Cornejo', label: 'Dario Cornejo' },
      { value: 'Andhy Chipana', label: 'Andhy Chipana' },
      { value: 'Equipo', label: 'Equipo' },
      { value: 'KevinCallo, darich1010', label: 'KevinC + darich' },
      { value: 'mathiasddf, PauloQuen', label: 'mathias + Paulo' },
    ];
  }

  getAssignees(): { value: string; label: string }[] {
    return this.getAssigneeOptions();
  }

  getTaskTypes() {
    return TASK_TYPES;
  }

  getColumns(): string[] {
    return ['product-backlog', 'sprint-backlog', 'inprogress', 'review', 'done'];
  }

  getColumnLabel(colId: string): string {
    const labels: Record<string, string> = {
      'product-backlog': 'Product Backlog',
      'sprint-backlog': 'Sprint Backlog',
      inprogress: 'In Progress',
      review: 'Review/QA (Testing)',
      done: 'Done',
    };
    return labels[colId] || colId;
  }

  /** Retorna el tablero para un sprint específico */
  getBoard(sprintKey: string): SprintBoard | undefined {
    return this.boards$()[sprintKey];
  }

  moveTask(sprintKey: string, taskId: string, fromColumn: string, toColumn: string): void {
    const boards = { ...this.boards$() };
    const board = boards[sprintKey];
    if (!board) return;

    const sourceItems = [...(board[fromColumn as keyof SprintBoard] as KanbanTask[])];
    const taskIndex = sourceItems.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return;
    const [moved] = sourceItems.splice(taskIndex, 1);
    const targetItems = [...(board[toColumn as keyof SprintBoard] as KanbanTask[])];
    targetItems.push(moved);

    (board[fromColumn as keyof SprintBoard] as KanbanTask[]) = sourceItems;
    (board[toColumn as keyof SprintBoard] as KanbanTask[]) = targetItems;
    boards[sprintKey] = { ...board };
    this.saveBoards(boards);
  }

  addTask(sprintKey: string, column: string, title: string, assignee: string, tag: string): void {
    if (!title.trim()) return;
    const boards = { ...this.boards$() };
    const board = boards[sprintKey];
    if (!board) return;

    const items = [...(board[column as keyof SprintBoard] as KanbanTask[])];
    const tagType = TASK_TYPES.find((t) => t.id === tag);
    items.push({
      id: 't' + Date.now(),
      title: title.trim(),
      assignee,
      tag,
      tagColor: tagType ? tagType.color : '#95a5a6',
    });
    (board[column as keyof SprintBoard] as KanbanTask[]) = items;
    boards[sprintKey] = { ...board };
    this.saveBoards(boards);
  }

  updateTask(sprintKey: string, taskId: string, title: string, assignee: string, tag: string): void {
    const boards = { ...this.boards$() };
    const board = boards[sprintKey];
    if (!board) return;
    const tagType = TASK_TYPES.find((t) => t.id === tag);

    for (const col of this.getColumns()) {
      const items = [...(board[col as keyof SprintBoard] as KanbanTask[])];
      const idx = items.findIndex((t) => t.id === taskId);
      if (idx !== -1) {
        items[idx] = {
          ...items[idx],
          title: title.trim(),
          assignee,
          tag,
          tagColor: tagType ? tagType.color : '#95a5a6',
        };
        (board[col as keyof SprintBoard] as KanbanTask[]) = items;
        break;
      }
    }
    boards[sprintKey] = { ...board };
    this.saveBoards(boards);
  }

  deleteTask(sprintKey: string, taskId: string): void {
    const boards = { ...this.boards$() };
    const board = boards[sprintKey];
    if (!board) return;

    for (const col of this.getColumns()) {
      const items = [...(board[col as keyof SprintBoard] as KanbanTask[])];
      const idx = items.findIndex((t) => t.id === taskId);
      if (idx !== -1) {
        items.splice(idx, 1);
        (board[col as keyof SprintBoard] as KanbanTask[]) = items;
        break;
      }
    }
    boards[sprintKey] = { ...board };
    this.saveBoards(boards);
  }

  resetToDefaults(): void {
    this.saveBoards(JSON.parse(JSON.stringify(DEFAULT_BOARDS)));
  }

  private saveBoards(boards?: SprintBoards): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(boards ?? { ...this.boards$() }));
    } catch {
      /* ignore */
    }
  }

  private loadBoards(): SprintBoards {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migration: ensure all columns exist for sprint0-sprint3
        const allCols = ['product-backlog', 'sprint-backlog', 'inprogress', 'review', 'done'];
        ['sprint0', 'sprint1', 'sprint2', 'sprint3'].forEach((sk) => {
          if (!parsed[sk]) parsed[sk] = {};
          allCols.forEach((col) => {
            if (!parsed[sk][col]) parsed[sk][col] = [];
            parsed[sk][col].forEach((t: KanbanTask) => {
              if (!t.tagColor && t.tag) {
                const found = TASK_TYPES.find((tt) => tt.id === t.tag);
                t.tagColor = found ? found.color : '#95a5a6';
              }
            });
          });
        });
        return parsed;
      }
    } catch {
      /* ignore */
    }
    return JSON.parse(JSON.stringify(DEFAULT_BOARDS));
  }
}
