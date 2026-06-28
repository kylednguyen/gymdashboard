import "server-only";
import Airtable from "airtable";
import { mapWorkout, mapBodyMetric, mapGoal } from "./airtable-map";
import { Workout, BodyMetric, Goal, RawRecord } from "./types";

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
  return records.map((r) => ({ id: r.id, fields: r.fields as Record<string, unknown> }));
}

export async function getWorkouts(): Promise<Workout[]> {
  return (await fetchTable("Workouts")).map(mapWorkout);
}

export async function getBodyMetrics(): Promise<BodyMetric[]> {
  return (await fetchTable("Body Metrics")).map(mapBodyMetric);
}

export async function getGoals(): Promise<Goal[]> {
  return (await fetchTable("Goals")).map(mapGoal);
}

export async function getDashboardData() {
  const [workouts, bodyMetrics, goals] = await Promise.all([
    getWorkouts(),
    getBodyMetrics(),
    getGoals(),
  ]);
  return { workouts, bodyMetrics, goals };
}
