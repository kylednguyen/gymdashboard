import { describe, it, expect } from "vitest";
import {
  weightSeries,
  latestWeight,
  targetFor,
  caloriesVsTargetSeries,
  latestLoggedDay,
  weeklyAverages,
  checkInForDate,
  dayTypeForDate,
  consumedMacros,
  targetMacrosFor,
  exercisesForDate,
  exerciseProgress,
  diaryDates,
} from "@/lib/metrics";
import { CheckIn, DailyTarget, WorkoutSet } from "@/lib/types";

const ci = (over: Partial<CheckIn> & { date: string }): CheckIn => ({
  id: over.date,
  workout: false,
  ...over,
});

const targets: DailyTarget[] = [
  { id: "td", name: "TD", dayType: "Training Day", calories: 2063, proteinG: 177, carbsG: 212, fatG: 53 },
  { id: "ntd", name: "NTD", dayType: "Non-Training Day", calories: 1535, proteinG: 166, carbsG: 84, fatG: 59 },
];

describe("weightSeries / latestWeight", () => {
  it("returns dated weights ascending and the most recent", () => {
    const data = [
      ci({ date: "2026-06-27", bodyweightLb: 181 }),
      ci({ date: "2026-06-20", bodyweightLb: 183 }),
      ci({ date: "2026-06-25" }), // no weight → skipped
    ];
    expect(weightSeries(data)).toEqual([
      { date: "2026-06-20", weight: 183 },
      { date: "2026-06-27", weight: 181 },
    ]);
    expect(latestWeight(data)).toBe(181);
  });

  it("returns null weight when none logged", () => {
    expect(latestWeight([])).toBeNull();
  });
});

describe("targetFor", () => {
  it("matches a day type", () => {
    expect(targetFor(targets, "Non-Training Day")?.calories).toBe(1535);
  });
  it("returns null for missing/unknown day type", () => {
    expect(targetFor(targets, undefined)).toBeNull();
  });
});

describe("caloriesVsTargetSeries", () => {
  it("pairs logged calories with that day's target", () => {
    const data = [
      ci({ date: "2026-06-28", dayType: "Training Day", caloriesLogged: 2100 }),
      ci({ date: "2026-06-27", dayType: "Non-Training Day", caloriesLogged: 1500 }),
      ci({ date: "2026-06-26" }), // no calories → skipped
    ];
    expect(caloriesVsTargetSeries(data, targets)).toEqual([
      { date: "2026-06-27", logged: 1500, target: 1535 },
      { date: "2026-06-28", logged: 2100, target: 2063 },
    ]);
  });
});

describe("latestLoggedDay", () => {
  it("returns the most recent logged day with its target", () => {
    const data = [
      ci({ date: "2026-06-26", dayType: "Training Day", caloriesLogged: 2000, proteinG: 170 }),
      ci({ date: "2026-06-28", dayType: "Non-Training Day", caloriesLogged: 1480, proteinG: 160, carbsG: 80, fatG: 55 }),
    ];
    expect(latestLoggedDay(data, targets)).toEqual({
      date: "2026-06-28",
      dayType: "Non-Training Day",
      logged: { calories: 1480, proteinG: 160, carbsG: 80, fatG: 55 },
      target: { calories: 1535, proteinG: 166, carbsG: 84, fatG: 59 },
    });
  });

  it("returns null when nothing is logged", () => {
    expect(latestLoggedDay([], targets)).toBeNull();
  });
});

describe("today helpers", () => {
  const data = [
    ci({ date: "2026-06-28", dayType: "Non-Training Day", caloriesLogged: 1480, proteinG: 160, carbsG: 80, fatG: 55 }),
    ci({ date: "2026-06-26", dayType: "Training Day", caloriesLogged: 2000 }),
  ];

  it("finds the check-in and day type for a date", () => {
    expect(checkInForDate(data, "2026-06-28")?.caloriesLogged).toBe(1480);
    expect(checkInForDate(data, "2026-06-27")).toBeNull();
    expect(dayTypeForDate(data, "2026-06-28")).toBe("Non-Training Day");
    expect(dayTypeForDate(data, "2026-06-27")).toBeNull();
  });

  it("reads consumed macros with zeros for a missing check-in", () => {
    expect(consumedMacros(checkInForDate(data, "2026-06-28"))).toEqual({
      calories: 1480,
      proteinG: 160,
      carbsG: 80,
      fatG: 55,
    });
    expect(consumedMacros(null)).toEqual({ calories: 0, proteinG: 0, carbsG: 0, fatG: 0 });
  });

  it("returns target macros for a day type", () => {
    expect(targetMacrosFor(targets, "Training Day")).toEqual({
      calories: 2063,
      proteinG: 177,
      carbsG: 212,
      fatG: 53,
    });
  });
});

describe("workout drill-down helpers", () => {
  const sets: WorkoutSet[] = [
    { id: "s1", exercise: "Back Squat", date: "2026-06-14", set: 1, reps: 5, weightLb: 225 },
    { id: "s2", exercise: "Back Squat", date: "2026-06-28", set: 1, reps: 5, weightLb: 245 },
    { id: "s3", exercise: "Back Squat", date: "2026-06-28", set: 2, reps: 4, weightLb: 245 },
    { id: "s4", exercise: "Leg Press", date: "2026-06-28", set: 1, reps: 10, weightLb: 360 },
  ];

  it("groups exercises for a date with their top weight", () => {
    const groups = exercisesForDate(sets, "2026-06-28");
    expect(groups.map((g) => g.exercise)).toEqual(["Back Squat", "Leg Press"]);
    expect(groups[0].sets).toHaveLength(2);
    expect(groups[0].topWeight).toBe(245);
  });

  it("builds an ascending per-exercise progress series of top weights", () => {
    expect(exerciseProgress(sets, "Back Squat")).toEqual([
      { date: "2026-06-14", weight: 225 },
      { date: "2026-06-28", weight: 245 },
    ]);
  });

  it("unions check-in and workout dates, newest first", () => {
    const checkIns: CheckIn[] = [ci({ date: "2026-06-26", caloriesLogged: 1500 })];
    expect(diaryDates(checkIns, sets)).toEqual(["2026-06-28", "2026-06-26", "2026-06-14"]);
  });
});

describe("weeklyAverages", () => {
  it("averages logged values within the last 7 days", () => {
    const data = [
      ci({ date: "2026-06-28", caloriesLogged: 2000, proteinG: 180 }),
      ci({ date: "2026-06-26", caloriesLogged: 1600, proteinG: 160 }),
      ci({ date: "2026-06-20", caloriesLogged: 9999, proteinG: 999 }), // outside window
    ];
    expect(weeklyAverages(data, "2026-06-28")).toEqual({
      daysLogged: 2,
      calories: 1800,
      proteinG: 170,
      carbsG: null,
      fatG: null,
    });
  });
});
