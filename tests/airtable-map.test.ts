import { describe, it, expect } from "vitest";
import { mapWorkout, mapBodyMetric, mapGoal } from "@/lib/airtable-map";

describe("mapWorkout", () => {
  it("maps fields to a Workout", () => {
    const rec = {
      id: "rec1",
      fields: { Date: "2026-06-20", Type: "Strength", Duration: 60, Notes: "legs" },
    };
    expect(mapWorkout(rec)).toEqual({
      id: "rec1",
      date: "2026-06-20",
      type: "Strength",
      durationMin: 60,
      notes: "legs",
    });
  });

  it("defaults duration to 0 and omits empty notes", () => {
    const rec = { id: "rec2", fields: { Date: "2026-06-21", Type: "Cardio" } };
    expect(mapWorkout(rec)).toEqual({
      id: "rec2",
      date: "2026-06-21",
      type: "Cardio",
      durationMin: 0,
    });
  });
});

describe("mapBodyMetric", () => {
  it("maps weight and body fat", () => {
    const rec = { id: "b1", fields: { Date: "2026-06-20", Weight: 80, "Body fat %": 18 } };
    expect(mapBodyMetric(rec)).toEqual({
      id: "b1",
      date: "2026-06-20",
      weight: 80,
      bodyFatPct: 18,
    });
  });
});

describe("mapGoal", () => {
  it("maps a goal with defaults", () => {
    const rec = {
      id: "g1",
      fields: { Name: "Bench 100kg", "Target value": 100, "Current value": 80, Unit: "kg", Status: "On track" },
    };
    expect(mapGoal(rec)).toEqual({
      id: "g1",
      name: "Bench 100kg",
      targetValue: 100,
      currentValue: 80,
      unit: "kg",
      status: "On track",
    });
  });
});
