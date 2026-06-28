import { describe, it, expect } from "vitest";
import {
  weightSeries,
  latestWeight,
  targetFor,
  caloriesVsTargetSeries,
  latestLoggedDay,
  weeklyAverages,
  dayBudget,
} from "@/lib/metrics";
import { CheckIn, DailyTarget } from "@/lib/types";

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

describe("dayBudget", () => {
  it("returns the target with zero consumed when nothing is logged", () => {
    const b = dayBudget([], targets, "Training Day");
    expect(b.target).toEqual({ calories: 2063, proteinG: 177, carbsG: 212, fatG: 53 });
    expect(b.consumed).toEqual({ calories: 0, proteinG: 0, carbsG: 0, fatG: 0 });
    expect(b.loggedDate).toBeNull();
  });

  it("uses the most recent matching-day-type check-in for consumed", () => {
    const data = [
      ci({ date: "2026-06-24", dayType: "Training Day", caloriesLogged: 1900, proteinG: 150 }),
      ci({ date: "2026-06-28", dayType: "Training Day", caloriesLogged: 2100, proteinG: 175, carbsG: 200, fatG: 50 }),
      ci({ date: "2026-06-27", dayType: "Non-Training Day", caloriesLogged: 1500 }),
    ];
    const b = dayBudget(data, targets, "Training Day");
    expect(b.consumed).toEqual({ calories: 2100, proteinG: 175, carbsG: 200, fatG: 50 });
    expect(b.loggedDate).toBe("2026-06-28");
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
