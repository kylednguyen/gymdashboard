import {
  CheckIn,
  DailyTarget,
  DayType,
  MacroSet,
  MealItem,
  MealTemplate,
  WorkoutSet,
} from "./types";

// --- date helpers (UTC day arithmetic on "YYYY-MM-DD" strings) ---
function toDayNum(iso: string): number {
  return Math.floor(Date.parse(iso + "T00:00:00Z") / 86_400_000);
}

/** Bodyweight readings, ascending by date — for the weight trend chart. */
export function weightSeries(
  checkIns: CheckIn[]
): { date: string; weight: number }[] {
  return checkIns
    .filter((c) => c.date && c.bodyweightLb !== undefined)
    .slice()
    .sort((a, b) => toDayNum(a.date) - toDayNum(b.date))
    .map((c) => ({ date: c.date, weight: c.bodyweightLb as number }));
}

/** The most recent recorded bodyweight, or null if none logged. */
export function latestWeight(checkIns: CheckIn[]): number | null {
  const series = weightSeries(checkIns);
  return series.length ? series[series.length - 1].weight : null;
}

/** The target row matching a day type, or null. */
export function targetFor(
  targets: DailyTarget[],
  dayType?: DayType
): DailyTarget | null {
  if (!dayType) return null;
  return targets.find((t) => t.dayType === dayType) ?? null;
}

function targetMacros(t: DailyTarget | null): MacroSet | null {
  if (!t) return null;
  return {
    calories: t.calories,
    proteinG: t.proteinG,
    carbsG: t.carbsG,
    fatG: t.fatG,
  };
}

/** Logged calories vs. that day's target, ascending — for the adherence chart. */
export function caloriesVsTargetSeries(
  checkIns: CheckIn[],
  targets: DailyTarget[]
): { date: string; logged: number; target: number | null }[] {
  return checkIns
    .filter((c) => c.date && c.caloriesLogged !== undefined)
    .slice()
    .sort((a, b) => toDayNum(a.date) - toDayNum(b.date))
    .map((c) => ({
      date: c.date,
      logged: c.caloriesLogged as number,
      target: targetFor(targets, c.dayType)?.calories ?? null,
    }));
}

export interface LoggedDay {
  date: string;
  dayType?: DayType;
  logged: MacroSet;
  target: MacroSet | null;
}

/** The most recent day with logged nutrition, paired with its target. */
export function latestLoggedDay(
  checkIns: CheckIn[],
  targets: DailyTarget[]
): LoggedDay | null {
  const logged = checkIns
    .filter((c) => c.date && c.caloriesLogged !== undefined)
    .slice()
    .sort((a, b) => toDayNum(a.date) - toDayNum(b.date));
  const c = logged[logged.length - 1];
  if (!c) return null;
  const day: LoggedDay = {
    date: c.date,
    logged: {
      calories: c.caloriesLogged ?? 0,
      proteinG: c.proteinG ?? 0,
      carbsG: c.carbsG ?? 0,
      fatG: c.fatG ?? 0,
    },
    target: targetMacros(targetFor(targets, c.dayType)),
  };
  if (c.dayType) day.dayType = c.dayType;
  return day;
}

export interface WeeklyAverages {
  daysLogged: number;
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
}

function avg(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

const ZERO: MacroSet = { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 };

/** The check-in for a specific date, or null. */
export function checkInForDate(checkIns: CheckIn[], date: string): CheckIn | null {
  return checkIns.find((c) => c.date === date) ?? null;
}

/** The most recent check-in by date, or null. */
export function latestCheckIn(checkIns: CheckIn[]): CheckIn | null {
  const dated = checkIns.filter((c) => c.date);
  if (dated.length === 0) return null;
  return dated.reduce((a, b) => (a.date >= b.date ? a : b));
}

/**
 * The check-in to feature on the Log tab: today's if logged, otherwise the most
 * recent one — so calories show even when today isn't logged yet.
 */
export function currentCheckIn(checkIns: CheckIn[], today: string): CheckIn | null {
  return checkInForDate(checkIns, today) ?? latestCheckIn(checkIns);
}

/**
 * The day type logged for a date (Training / Non-Training), if any — used to
 * proactively pre-select the filter on the Log page based on today's check-in.
 */
export function dayTypeForDate(checkIns: CheckIn[], date: string): DayType | null {
  return checkInForDate(checkIns, date)?.dayType ?? null;
}

/** A check-in's logged calories + macros, with zeros for anything unfilled. */
export function consumedMacros(c: CheckIn | null): MacroSet {
  if (!c) return ZERO;
  return {
    calories: c.caloriesLogged ?? 0,
    proteinG: c.proteinG ?? 0,
    carbsG: c.carbsG ?? 0,
    fatG: c.fatG ?? 0,
  };
}

/** Target calories + macros for a day type as a MacroSet, or null. */
export function targetMacrosFor(targets: DailyTarget[], dayType: DayType): MacroSet | null {
  return targetMacros(targetFor(targets, dayType));
}

/** Rows whose date falls within the last `days` days ending at `today` (null = all). */
export function withinDays<T extends { date: string }>(
  rows: T[],
  today: string,
  days: number | null
): T[] {
  if (days === null) return rows;
  const end = toDayNum(today);
  const start = end - (days - 1);
  return rows.filter((r) => {
    const d = toDayNum(r.date);
    return d >= start && d <= end;
  });
}

/** Meal slots in the order they appear through a day. Unknown slots sort last. */
const SLOT_ORDER = ["Shake", "Preworkout Meal", "Post Workout Meal", "Meal 2", "Meal 3", "Meal 4"];

function slotIndex(slot?: string): number {
  const i = slot ? SLOT_ORDER.indexOf(slot) : -1;
  return i === -1 ? SLOT_ORDER.length : i;
}

export interface MealPlanSlot {
  template: MealTemplate;
  items: MealItem[];
}

/** The meal plan for a day type: its meal slots in day order, each with its items. */
export function mealPlanFor(
  templates: MealTemplate[],
  items: MealItem[],
  dayType: DayType
): MealPlanSlot[] {
  return templates
    .filter((t) => t.dayType === dayType)
    .slice()
    .sort((a, b) => slotIndex(a.mealSlot) - slotIndex(b.mealSlot))
    .map((template) => ({
      template,
      items: items.filter(
        (i) => i.dayType === dayType && i.mealSlot === template.mealSlot
      ),
    }));
}

export interface ExerciseGroup {
  exercise: string;
  sets: WorkoutSet[];
  topWeight: number | null;
}

/** Exercises hit on a date, each with its sets (ordered) and top working weight. */
export function exercisesForDate(sets: WorkoutSet[], date: string): ExerciseGroup[] {
  const byEx = new Map<string, WorkoutSet[]>();
  for (const s of sets) {
    if (s.date !== date) continue;
    if (!byEx.has(s.exercise)) byEx.set(s.exercise, []);
    byEx.get(s.exercise)!.push(s);
  }
  return [...byEx.entries()].map(([exercise, list]) => {
    const ordered = list.slice().sort((a, b) => (a.set ?? 0) - (b.set ?? 0));
    const weights = ordered.map((s) => s.weightLb).filter((w): w is number => w !== undefined);
    return {
      exercise,
      sets: ordered,
      topWeight: weights.length ? Math.max(...weights) : null,
    };
  });
}

export interface ExerciseSummary {
  exercise: string;
  lastDate: string;
  topWeight: number | null;
}

/** Every logged exercise with its most recent date and all-time top weight, most recent first. */
export function exerciseSummaries(sets: WorkoutSet[]): ExerciseSummary[] {
  const byEx = new Map<string, ExerciseSummary>();
  for (const s of sets) {
    if (!s.exercise || !s.date) continue;
    const cur = byEx.get(s.exercise);
    if (!cur) {
      byEx.set(s.exercise, {
        exercise: s.exercise,
        lastDate: s.date,
        topWeight: s.weightLb ?? null,
      });
      continue;
    }
    if (s.date > cur.lastDate) cur.lastDate = s.date;
    if (s.weightLb !== undefined && (cur.topWeight === null || s.weightLb > cur.topWeight)) {
      cur.topWeight = s.weightLb;
    }
  }
  return [...byEx.values()].sort((a, b) =>
    a.lastDate === b.lastDate
      ? a.exercise.localeCompare(b.exercise)
      : a.lastDate < b.lastDate
        ? 1
        : -1
  );
}

/** Top working weight per date for one exercise, ascending — the progress series. */
export function exerciseProgress(
  sets: WorkoutSet[],
  exercise: string
): { date: string; weight: number }[] {
  const byDate = new Map<string, number>();
  for (const s of sets) {
    if (s.exercise !== exercise || !s.date || s.weightLb === undefined) continue;
    byDate.set(s.date, Math.max(byDate.get(s.date) ?? 0, s.weightLb));
  }
  return [...byDate.entries()]
    .map(([date, weight]) => ({ date, weight }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

/** All dates that have either a check-in or a logged workout set, newest first. */
export function diaryDates(checkIns: CheckIn[], sets: WorkoutSet[]): string[] {
  const dates = new Set<string>();
  for (const c of checkIns) if (c.date) dates.add(c.date);
  for (const s of sets) if (s.date) dates.add(s.date);
  return [...dates].sort((a, b) => (a < b ? 1 : -1));
}

/** Averages over check-ins within the last `days` days (inclusive of today). */
export function weeklyAverages(
  checkIns: CheckIn[],
  today: string,
  days = 7
): WeeklyAverages {
  const end = toDayNum(today);
  const start = end - (days - 1);
  const inWindow = checkIns.filter((c) => {
    if (!c.date) return false;
    const d = toDayNum(c.date);
    return d >= start && d <= end;
  });
  const defined = (pick: (c: CheckIn) => number | undefined): number[] =>
    inWindow.map(pick).filter((v): v is number => v !== undefined);
  return {
    daysLogged: inWindow.filter((c) => c.caloriesLogged !== undefined).length,
    calories: avg(defined((c) => c.caloriesLogged)),
    proteinG: avg(defined((c) => c.proteinG)),
    carbsG: avg(defined((c) => c.carbsG)),
    fatG: avg(defined((c) => c.fatG)),
  };
}
