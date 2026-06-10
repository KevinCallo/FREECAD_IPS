export const TASK_TYPES: TaskType[] = [
  { id: 'task', label: 'Task', color: '#95a5a6' },
  { id: 'feature', label: 'Feature', color: '#f39c12' },
  { id: 'bug', label: 'Bug', color: '#e74c3c' },
  { id: 'docs', label: 'Docs', color: '#8e44ad' },
  { id: 'research', label: 'Research', color: '#3498db' },
];

export const COLUMNS: KanbanColumn[] = [
  { id: 'product-backlog', label: 'Product Backlog', icon: 'fa-inbox' },
  { id: 'sprint-backlog', label: 'Sprint Backlog', icon: 'fa-rectangle-list' },
  { id: 'inprogress', label: 'In Progress', icon: 'fa-spinner' },
  { id: 'review', label: 'Review/QA (Testing)', icon: 'fa-flask' },
  { id: 'done', label: 'Done', icon: 'fa-check-circle' },
];

export interface TaskType {
  id: string;
  label: string;
  color: string;
}

export interface KanbanColumn {
  id: string;
  label: string;
  icon: string;
}

export interface KanbanTask {
  id: string;
  title: string;
  assignee: string;
  tag: string;
  tagColor: string;
}

export interface SprintBoard {
  label: string;
  icon: string;
  'product-backlog': KanbanTask[];
  'sprint-backlog': KanbanTask[];
  inprogress: KanbanTask[];
  review: KanbanTask[];
  done: KanbanTask[];
}

export type SprintBoards = Record<string, SprintBoard>;
