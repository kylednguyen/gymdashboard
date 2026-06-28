// Read-only, server-only data layer.
// - `server-only` makes the build fail if this module is ever imported into a
//   Client Component, so AIRTABLE_PAT can never be bundled to the browser.
// - Every call uses `.select()` only; no create/update/destroy is ever issued,
//   so the dashboard cannot mutate the Airtable base.
import "server-only";
import Airtable from "airtable";
import {
  mapCheckIn,
  mapDailyTarget,
  mapMealTemplate,
  mapMealItem,
  mapWorkoutSet,
} from "./airtable-map";
import {
  CheckIn,
  DailyTarget,
  MealTemplate,
  MealItem,
  WorkoutSet,
  RawRecord,
} from "./types";

function getBase() {
  const pat = process.env.AIRTABLE_PAT;
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!pat || !baseId) {
    throw new Error("Missing AIRTABLE_PAT or AIRTABLE_BASE_ID env var");
  }
  return new Airtable({ apiKey: pat }).base(baseId);
}

async function fetchTable(name: string): Promise<RawRecord[]> {
  const records = await getBase()(name).select().all();
  return records
    .map((r) => ({ id: r.id, fields: r.fields as Record<string, unknown> }))
    // Skip empty rows (e.g. a placeholder Daily Target with no fields filled in).
    .filter((r) => Object.keys(r.fields).length > 0);
}

export async function getCheckIns(): Promise<CheckIn[]> {
  return (await fetchTable("Check Ins")).map(mapCheckIn);
}

export async function getDailyTargets(): Promise<DailyTarget[]> {
  return (await fetchTable("Daily Targets")).map(mapDailyTarget);
}

export async function getMealTemplates(): Promise<MealTemplate[]> {
  return (await fetchTable("Meal Templates")).map(mapMealTemplate);
}

export async function getMealItems(): Promise<MealItem[]> {
  return (await fetchTable("Meal Items")).map(mapMealItem);
}

export async function getWorkoutSets(): Promise<WorkoutSet[]> {
  return (await fetchTable("Workout Log")).map(mapWorkoutSet);
}

export async function getDashboardData(): Promise<{
  checkIns: CheckIn[];
  targets: DailyTarget[];
  mealTemplates: MealTemplate[];
  mealItems: MealItem[];
  workoutSets: WorkoutSet[];
}> {
  const [checkIns, targets, mealTemplates, mealItems, workoutSets] = await Promise.all([
    getCheckIns(),
    getDailyTargets(),
    getMealTemplates(),
    getMealItems(),
    getWorkoutSets(),
  ]);
  return { checkIns, targets, mealTemplates, mealItems, workoutSets };
}
