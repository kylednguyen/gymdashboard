import { Workout, BodyMetric, Goal } from "./types";

// --- date helpers (UTC day arithmetic on "YYYY-MM-DD" strings) ---
function toDayNum(iso: string): number {
  return Math.floor(Date.parse(iso + "T00:00:00Z") / 86_400_000);
}
function fromDayNum(n: number): string {
  return new Date(n * 86_400_000).toISOString().slice(0, 10);
}

export function workoutsThisWeek(workouts: Workout[], today: string): number {
  const end = toDayNum(today);
  const start = end - 6;
  return workouts.filter((wk) => {
    if (!wk.date) return false;
    const d = toDayNum(wk.date);
    return d >= start && d <= end;
  }).length;
}

export function currentStreak(workouts: Workout[], today: string): number {
  const days = new Set(workouts.filter((wk) => wk.date).map((wk) => toDayNum(wk.date)));
  const end = toDayNum(today);
  let cursor = days.has(end) ? end : days.has(end - 1) ? end - 1 : null;
  if (cursor === null) return 0;
  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor--;
  }
  return streak;
}

export function latestWeight(metrics: BodyMetric[]): number | null {
  const dated = metrics.filter((m) => m.date);
  if (dated.length === 0) return null;
  const latest = dated.reduce((a, b) => (toDayNum(b.date) > toDayNum(a.date) ? b : a));
  return latest.weight;
}

export function goalsOnTrack(goals: Goal[]): number {
  return goals.filter((g) => g.status === "On track" || g.status === "Done").length;
}

export function weightSeries(metrics: BodyMetric[]): { date: string; weight: number }[] {
  return metrics
    .filter((m) => m.date)
    .sort((a, b) => toDayNum(a.date) - toDayNum(b.date))
    .map((m) => ({ date: m.date, weight: m.weight }));
}

export function consistencyMap(
  workouts: Workout[],
  today: string,
  days: number
): { date: string; count: number }[] {
  const counts = new Map<number, number>();
  for (const wk of workouts) {
    if (!wk.date) continue;
    const d = toDayNum(wk.date);
    counts.set(d, (counts.get(d) ?? 0) + 1);
  }
  const end = toDayNum(today);
  const out: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = end - i;
    out.push({ date: fromDayNum(d), count: counts.get(d) ?? 0 });
  }
  return out;
}
