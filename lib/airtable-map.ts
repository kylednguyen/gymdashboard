import {
  RawRecord,
  CheckIn,
  DailyTarget,
  MealTemplate,
  MealItem,
  WorkoutSet,
  DayType,
} from "./types";

const str = (v: unknown): string | undefined =>
  typeof v === "string" && v.trim() !== "" ? v : undefined;
const num = (v: unknown): number | undefined =>
  typeof v === "number" ? v : undefined;
const bool = (v: unknown): boolean => v === true;

// Airtable returns singleSelect values as the plain choice name over the REST SDK.
const dayType = (v: unknown): DayType | undefined => {
  const s = str(v);
  return s === "Training Day" || s === "Non-Training Day" ? s : undefined;
};

export function mapCheckIn(rec: RawRecord): CheckIn {
  const f = rec.fields;
  const c: CheckIn = {
    id: rec.id,
    date: str(f["Check-in Date"]) ?? "",
    workout: bool(f["Workout"]),
  };
  const dt = dayType(f["Day Type"]);
  if (dt) c.dayType = dt;
  const weight = num(f["Bodyweight lb"]);
  if (weight !== undefined) c.bodyweightLb = weight;
  const cal = num(f["Calories Logged"]);
  if (cal !== undefined) c.caloriesLogged = cal;
  const protein = num(f["Protein Logged g"]);
  if (protein !== undefined) c.proteinG = protein;
  const carbs = num(f["Carbs Logged g"]);
  if (carbs !== undefined) c.carbsG = carbs;
  const fat = num(f["Fat Logged g"]);
  if (fat !== undefined) c.fatG = fat;
  const steps = num(f["Steps"]);
  if (steps !== undefined) c.steps = steps;
  const notes = str(f["Notes"]);
  if (notes) c.notes = notes;
  return c;
}

export function mapDailyTarget(rec: RawRecord): DailyTarget {
  const f = rec.fields;
  const t: DailyTarget = {
    id: rec.id,
    name: str(f["Target Name"]) ?? "",
    calories: num(f["Calories"]) ?? 0,
    proteinG: num(f["Protein g"]) ?? 0,
    carbsG: num(f["Carbs g"]) ?? 0,
    fatG: num(f["Fat g"]) ?? 0,
  };
  const dt = dayType(f["Day Type"]);
  if (dt) t.dayType = dt;
  const notes = str(f["Notes"]);
  if (notes) t.notes = notes;
  return t;
}

export function mapMealTemplate(rec: RawRecord): MealTemplate {
  const f = rec.fields;
  const m: MealTemplate = {
    id: rec.id,
    name: str(f["Meal Template"]) ?? "",
  };
  const dt = dayType(f["Day Type"]);
  if (dt) m.dayType = dt;
  const slot = str(f["Meal Slot"]);
  if (slot) m.mealSlot = slot;
  const timing = str(f["Timing"]);
  if (timing) m.timing = timing;
  const notes = str(f["Notes"]);
  if (notes) m.notes = notes;
  return m;
}

export function mapWorkoutSet(rec: RawRecord): WorkoutSet {
  const f = rec.fields;
  const w: WorkoutSet = {
    id: rec.id,
    date: str(f["Date"]) ?? "",
    exercise: str(f["Exercise"]) ?? "",
  };
  const set = num(f["Set"]);
  if (set !== undefined) w.set = set;
  const reps = num(f["Reps"]);
  if (reps !== undefined) w.reps = reps;
  const weight = num(f["Weight lb"]);
  if (weight !== undefined) w.weightLb = weight;
  const notes = str(f["Notes"]);
  if (notes) w.notes = notes;
  return w;
}

export function mapMealItem(rec: RawRecord): MealItem {
  const f = rec.fields;
  const m: MealItem = {
    id: rec.id,
    entry: str(f["Item Entry"]) ?? "",
    food: str(f["Food"]) ?? "",
  };
  const dt = dayType(f["Day Type"]);
  if (dt) m.dayType = dt;
  const slot = str(f["Meal Slot"]);
  if (slot) m.mealSlot = slot;
  const amount = num(f["Amount g"]);
  if (amount !== undefined) m.amountG = amount;
  const state = str(f["State"]);
  if (state) m.state = state;
  const group = str(f["Option Group"]);
  if (group) m.optionGroup = group;
  const notes = str(f["Notes"]);
  if (notes) m.notes = notes;
  return m;
}
