import { RawRecord, Workout, BodyMetric, Goal, WorkoutType, GoalStatus } from "./types";

const str = (v: unknown): string | undefined =>
  typeof v === "string" && v.trim() !== "" ? v : undefined;
const num = (v: unknown): number | undefined =>
  typeof v === "number" ? v : undefined;

export function mapWorkout(rec: RawRecord): Workout {
  const f = rec.fields;
  const w: Workout = {
    id: rec.id,
    date: str(f["Date"]) ?? "",
    type: (str(f["Type"]) as WorkoutType) ?? "Strength",
    durationMin: num(f["Duration"]) ?? 0,
  };
  const notes = str(f["Notes"]);
  if (notes) w.notes = notes;
  return w;
}

export function mapBodyMetric(rec: RawRecord): BodyMetric {
  const f = rec.fields;
  const m: BodyMetric = {
    id: rec.id,
    date: str(f["Date"]) ?? "",
    weight: num(f["Weight"]) ?? 0,
  };
  const bf = num(f["Body fat %"]);
  if (bf !== undefined) m.bodyFatPct = bf;
  return m;
}

export function mapGoal(rec: RawRecord): Goal {
  const f = rec.fields;
  const g: Goal = {
    id: rec.id,
    name: str(f["Name"]) ?? "",
    targetValue: num(f["Target value"]) ?? 0,
    currentValue: num(f["Current value"]) ?? 0,
    unit: str(f["Unit"]) ?? "",
    status: (str(f["Status"]) as GoalStatus) ?? "On track",
  };
  const td = str(f["Target date"]);
  if (td) g.targetDate = td;
  return g;
}
