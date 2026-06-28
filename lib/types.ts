export const UNIT_WEIGHT = "kg";

export type WorkoutType = "Strength" | "Cardio" | "Mobility";
export type GoalStatus = "On track" | "At risk" | "Done";

export interface Workout {
  id: string;
  date: string; // ISO "YYYY-MM-DD"
  type: WorkoutType;
  durationMin: number;
  notes?: string;
}

export interface BodyMetric {
  id: string;
  date: string; // ISO "YYYY-MM-DD"
  weight: number;
  bodyFatPct?: number;
}

export interface Goal {
  id: string;
  name: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  targetDate?: string;
  status: GoalStatus;
}

export interface RawRecord {
  id: string;
  fields: Record<string, unknown>;
}
