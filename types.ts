export type MealStatus = 'skipped' | 'off_diet' | 'on_diet';

export interface MealLog {
  breakfast: MealStatus;
  morningSnack: MealStatus;
  lunch: MealStatus;
  afternoonSnack: MealStatus;
  dinner: MealStatus;
  supper: MealStatus;
}

export interface DailyLog {
  date: string; // ISO YYYY-MM-DD
  weight: number | null;
  waterMl: number;
  didRun: boolean;
  runCalories: number;
  didGym: boolean;
  gymCalories: number;
  meals: MealLog;
  notes?: string;
}

export interface AppState {
  currentDate: string;
  logs: Record<string, DailyLog>; // Keyed by date string
  loading: boolean;
}

// Map key to readable Portuguese label
export const MEAL_LABELS: Record<keyof MealLog, string> = {
  breakfast: 'Café da Manhã',
  morningSnack: 'Lanche da Manhã',
  lunch: 'Almoço',
  afternoonSnack: 'Lanche da Tarde',
  dinner: 'Jantar',
  supper: 'Ceia',
};