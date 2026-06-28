import { CheckIn, DailyTarget, DayType, MacroSet } from "./types";

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
