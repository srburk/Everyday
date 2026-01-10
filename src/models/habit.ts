export type FrequencyType = "daily" | "specific_days" | "times_per_week";

export interface HabitFrequency {
  type: FrequencyType;
  days?: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  timesPerWeek?: number; // 1-7
}

export interface Habit {
  id: string;
  name: string;
  frequency: HabitFrequency;
  color: string;
  createdAt: string; // ISO date
  archivedAt: string | null;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  completedAt: string; // YYYY-MM-DD
}

export interface HabitWithStats extends Habit {
  currentStreak: number;
  longestStreak: number;
  completedToday: boolean;
  completionsThisWeek: number;
}

export interface CreateHabitInput {
  name: string;
  frequency: HabitFrequency;
  color?: string;
}
