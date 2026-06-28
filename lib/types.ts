// Weight is recorded in pounds in the "Aggregate Gym Profile" base.
export const UNIT_WEIGHT = "lb";

export type DayType = "Training Day" | "Non-Training Day";

/** One row of the daily "Check Ins" log. */
export interface CheckIn {
  id: string;
  date: string; // ISO "YYYY-MM-DD"
  dayType?: DayType;
  bodyweightLb?: number;
  caloriesLogged?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  steps?: number;
  workout: boolean;
  notes?: string;
}

/** A calorie/macro target for a given day type, from "Daily Targets". */
export interface DailyTarget {
  id: string;
  name: string;
  dayType?: DayType;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  notes?: string;
}

/** A meal slot within a day type, from "Meal Templates". */
export interface MealTemplate {
  id: string;
  name: string;
  dayType?: DayType;
  mealSlot?: string;
  timing?: string;
  notes?: string;
}

/** A single food portion within a meal slot, from "Meal Items". */
export interface MealItem {
  id: string;
  entry: string;
  dayType?: DayType;
  mealSlot?: string;
  food: string;
  amountG?: number;
  state?: string;
  optionGroup?: string;
  notes?: string;
}

/** One working set from the "Workout Log" table. */
export interface WorkoutSet {
  id: string;
  date: string; // ISO "YYYY-MM-DD"
  exercise: string;
  set?: number;
  reps?: number;
  weightLb?: number;
  notes?: string;
}

/** A calories + macros bundle, used for both logged values and targets. */
export interface MacroSet {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface RawRecord {
  id: string;
  fields: Record<string, unknown>;
}
