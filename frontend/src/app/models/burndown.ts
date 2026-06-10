export interface BurndownDay {
  day: number;
  remaining: number;
  ideal?: number;
}

export interface BurndownData {
  label: string;
  totalPoints: number;
  actual: BurndownDay[];
  status: string;
  color: string;
  achievement: string;
  description: string;
}

export type BurndownDataMap = Record<string, BurndownData>;
