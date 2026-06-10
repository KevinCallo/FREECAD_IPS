import { Component, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KanbanService } from '../../services/kanban.service';
import { SprintService } from '../../services/sprint.service';
import { KanbanTask } from '../../models';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './kanban-board.component.html',
  styleUrl: './kanban-board.component.css',
})
export class KanbanBoardComponent {
  private kanbanService = inject(KanbanService);
  private sprintService = inject(SprintService);

  readonly sprints = this.sprintService.sprints;
  readonly selectedSprintKey = this.sprintService.selectedSprintKey;
  readonly boards = this.kanbanService.boards$;
  readonly isEditable = computed(() => this.selectedSprintKey() === 'sprint2');
  readonly columns = this.kanbanService.getColumns();
  readonly columnLabels: Record<string, string> = {
    'product-backlog': 'Product Backlog',
    'sprint-backlog': 'Sprint Backlog',
    inprogress: 'In Progress',
    review: 'Review/QA (Testing)',
    done: 'Done',
  };

  dragTask: KanbanTask | null = null;
  dragSourceCol: string | null = null;
  dragOverCol: string | null = null;

  /** Retorna las tarjetas de una columna del sprint seleccionado */
  getColumn(colId: string): KanbanTask[] {
    const board = this.kanbanService.getBoard(this.selectedSprintKey());
    if (!board) return [];
    return (board[colId as keyof typeof board] as KanbanTask[]) ?? [];
  }

  /** Cambia el sprint desde las tabs del kanban → sincronizado con SprintService */
  setActiveSprint(key: string): void {
    this.sprintService.selectSprint(key);
  }

  /* Drag & Drop */
  onDragStart(task: KanbanTask, colId: string): void {
    if (!this.isEditable()) return;
    this.dragTask = task;
    this.dragSourceCol = colId;
  }

  onDragOver(e: DragEvent, colId: string): void {
    if (!this.isEditable() || !this.dragTask) return;
    e.preventDefault();
    this.dragOverCol = colId;
  }

  onDragLeave(colId: string): void {
    if (this.dragOverCol === colId) {
      this.dragOverCol = null;
    }
  }

  onDrop(colId: string): void {
    if (!this.isEditable() || !this.dragTask || !this.dragSourceCol) return;
    if (this.dragSourceCol !== colId) {
      this.kanbanService.moveTask(this.selectedSprintKey(), this.dragTask.id, this.dragSourceCol, colId);
    }
    this.dragTask = null;
    this.dragSourceCol = null;
    this.dragOverCol = null;
  }

  onDragEnd(): void {
    this.dragTask = null;
    this.dragSourceCol = null;
    this.dragOverCol = null;
  }

  /* CRUD modals */
  showAddModal = false;
  addColumn = '';
  editTask: KanbanTask | null = null;
  editColumn = '';
  newTitle = '';
  newAssignee = '';
  newTag = 'task';

  openAdd(colId: string): void {
    if (!this.isEditable()) return;
    this.showAddModal = true;
    this.addColumn = colId;
    this.newTitle = '';
    this.newAssignee = 'Equipo';
    this.newTag = 'task';
    this.editTask = null;
  }

  openEdit(task: KanbanTask, colId: string): void {
    if (!this.isEditable()) return;
    this.showAddModal = true;
    this.editTask = task;
    this.editColumn = colId;
    this.newTitle = task.title;
    this.newAssignee = task.assignee;
    this.newTag = task.tag;
  }

  closeModal(): void {
    this.showAddModal = false;
    this.editTask = null;
  }

  saveTask(): void {
    if (!this.newTitle.trim()) return;
    if (this.editTask) {
      this.kanbanService.updateTask(this.selectedSprintKey(), this.editTask.id, this.newTitle, this.newAssignee, this.newTag);
    } else {
      this.kanbanService.addTask(this.selectedSprintKey(), this.addColumn, this.newTitle, this.newAssignee, this.newTag);
    }
    this.closeModal();
  }

  deleteTask(taskId: string): void {
    if (!this.isEditable()) return;
    if (window.confirm('¿Estás seguro de eliminar esta tarea?')) {
      this.kanbanService.deleteTask(this.selectedSprintKey(), taskId);
      this.closeModal();
    }
  }

  resetBoard(): void {
    if (window.confirm('¿Resetear todo el tablero a los valores por defecto? Esta acción no se puede deshacer.')) {
      this.kanbanService.resetToDefaults();
    }
  }

  getAssignees(): { value: string; label: string }[] {
    return this.kanbanService.getAssignees();
  }

  getTaskTypes() {
    return this.kanbanService.getTaskTypes();
  }
}
