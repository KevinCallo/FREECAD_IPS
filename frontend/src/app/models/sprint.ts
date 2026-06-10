export interface Sprint {
  key: string;
  label: string;
  start: Date;
  end: Date;
  status: 'done' | 'active' | 'pending';
  storyPoints: number;
  description: string;
  goals: SprintGoal[];
  backlog: SprintBacklogItem[];
  progress: number;
}

export interface SprintGoal {
  icon: string;
  title: string;
  description: string;
  status: 'done' | 'active' | 'pending';
}

export interface SprintBacklogItem {
  title: string;
  done: boolean;
}

export interface MetricSummary {
  sprintsCompleted: number;
  activeSprint: number;
  totalSprints: number;
  daysPerSprint: number;
}
