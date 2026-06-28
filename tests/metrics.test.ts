import { describe, it, expect } from "vitest";
import {
  workoutsThisWeek,
  currentStreak,
  latestWeight,
  goalsOnTrack,
  weightSeries,
  consistencyMap,
} from "@/lib/metrics";
import { Workout, BodyMetric, Goal } from "@/lib/types";

const w = (date: string): Workout => ({ id: date, date, type: "Strength", durationMin: 30 });

describe("workoutsThisWeek", () => {
  it("counts workouts within the last 7 days inclusive", () => {
    const data = [w("2026-06-28"), w("2026-06-22"), w("2026-06-21")];
    expect(workoutsThisWeek(data, "2026-06-28")).toBe(2); // 28 and 22, not 21
  });
});

describe("currentStreak", () => {
  it("counts consecutive days ending today", () => {
    const data = [w("2026-06-28"), w("2026-06-27"), w("2026-06-26")];
    expect(currentStreak(data, "2026-06-28")).toBe(3);
  });
  it("allows today to be missing if yesterday has a workout", () => {
    const data = [w("2026-06-27"), w("2026-06-26")];
    expect(currentStreak(data, "2026-06-28")).toBe(2);
  });
  it("is zero when the most recent workout is older than yesterday", () => {
    const data = [w("2026-06-25")];
    expect(currentStreak(data, "2026-06-28")).toBe(0);
  });
});

describe("latestWeight", () => {
  it("returns the most recent weight", () => {
    const m: BodyMetric[] = [
      { id: "1", date: "2026-06-20", weight: 81 },
      { id: "2", date: "2026-06-27", weight: 80 },
    ];
    expect(latestWeight(m)).toBe(80);
  });
  it("returns null for empty", () => {
    expect(latestWeight([])).toBeNull();
  });
});

describe("goalsOnTrack", () => {
  it("counts On track and Done", () => {
    const g: Goal[] = [
      { id: "1", name: "a", targetValue: 1, currentValue: 1, unit: "kg", status: "On track" },
      { id: "2", name: "b", targetValue: 1, currentValue: 0, unit: "kg", status: "At risk" },
      { id: "3", name: "c", targetValue: 1, currentValue: 1, unit: "kg", status: "Done" },
    ];
    expect(goalsOnTrack(g)).toBe(2);
  });
});

describe("weightSeries", () => {
  it("sorts ascending by date", () => {
    const m: BodyMetric[] = [
      { id: "1", date: "2026-06-27", weight: 80 },
      { id: "2", date: "2026-06-20", weight: 81 },
    ];
    expect(weightSeries(m)).toEqual([
      { date: "2026-06-20", weight: 81 },
      { date: "2026-06-27", weight: 80 },
    ]);
  });
});

describe("consistencyMap", () => {
  it("returns one entry per day with workout counts", () => {
    const data = [w("2026-06-28"), w("2026-06-28"), w("2026-06-26")];
    const result = consistencyMap(data, "2026-06-28", 3);
    expect(result).toEqual([
      { date: "2026-06-26", count: 1 },
      { date: "2026-06-27", count: 0 },
      { date: "2026-06-28", count: 2 },
    ]);
  });
});
