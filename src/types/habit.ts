export interface Habit {
  id: string;
  name: string;
  createdAt: string;
  color?: string;
}

export type HabitPatch = Partial<Pick<Habit, 'name' | 'color'>>;

export interface HabitCompletion {
  habitId: string;
  date: string; // Format: YYYY-MM-DD
}

export interface DayStats {
  date: string;
  completed: number;
  total: number;
  percentage: number;
}

export interface HabitWithStats extends Habit {
  currentStreak: number;
  longestStreak: number;
  completedDates: string[];
}
