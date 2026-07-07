import { describe, it, expect } from "vitest";
import {
  mapCheckIn,
  mapDailyTarget,
  mapMealTemplate,
  mapMealItem,
  mapWorkoutSet,
} from "@/lib/airtable-map";

describe("mapCheckIn", () => {
  it("maps a fully logged day", () => {
    const rec = {
      id: "c1",
      fields: {
        "Check-in Date": "2026-06-28",
        "Day Type": "Training Day",
        "Bodyweight lb": 182.4,
        "Calories Logged": 2050,
        "Protein Logged g": 180,
        "Carbs Logged g": 210,
        "Fat Logged g": 55,
        Steps: 9000,
        Workout: true,
        Notes: "felt strong",
      },
    };
    expect(mapCheckIn(rec)).toEqual({
      id: "c1",
      date: "2026-06-28",
      dayType: "Training Day",
      bodyweightLb: 182.4,
      caloriesLogged: 2050,
      proteinG: 180,
      carbsG: 210,
      fatG: 55,
      steps: 9000,
      workout: true,
      notes: "felt strong",
    });
  });

  it("defaults workout to false and omits absent fields", () => {
    const rec = { id: "c2", fields: { "Check-in Date": "2026-06-27" } };
    expect(mapCheckIn(rec)).toEqual({ id: "c2", date: "2026-06-27", workout: false });
  });

  it("ignores an unknown day type", () => {
    const rec = { id: "c3", fields: { "Check-in Date": "2026-06-27", "Day Type": "Rest" } };
    expect(mapCheckIn(rec).dayType).toBeUndefined();
  });

  // The live base's Check Ins select has a bare "Training" choice alongside
  // "Training Day" — both must resolve to the canonical day type.
  it("normalizes day type variants", () => {
    const withDayType = (v: string) =>
      mapCheckIn({ id: "c4", fields: { "Check-in Date": "2026-06-29", "Day Type": v } }).dayType;
    expect(withDayType("Training")).toBe("Training Day");
    expect(withDayType("training day")).toBe("Training Day");
    expect(withDayType("Non-Training")).toBe("Non-Training Day");
    expect(withDayType("Non Training Day")).toBe("Non-Training Day");
  });
});

describe("mapDailyTarget", () => {
  it("maps targets with defaults", () => {
    const rec = {
      id: "t1",
      fields: {
        "Target Name": "1800 Plan — Training Day",
        "Day Type": "Training Day",
        Calories: 2063,
        "Protein g": 177,
        "Carbs g": 212,
        "Fat g": 53,
      },
    };
    expect(mapDailyTarget(rec)).toEqual({
      id: "t1",
      name: "1800 Plan — Training Day",
      dayType: "Training Day",
      calories: 2063,
      proteinG: 177,
      carbsG: 212,
      fatG: 53,
    });
  });
});

describe("mapMealTemplate", () => {
  it("maps a meal slot template", () => {
    const rec = {
      id: "m1",
      fields: {
        "Meal Template": "TD — Shake",
        "Day Type": "Training Day",
        "Meal Slot": "Shake",
        Timing: "Anytime",
        Notes: "Oats, whey isolate, berries.",
      },
    };
    expect(mapMealTemplate(rec)).toEqual({
      id: "m1",
      name: "TD — Shake",
      dayType: "Training Day",
      mealSlot: "Shake",
      timing: "Anytime",
      notes: "Oats, whey isolate, berries.",
    });
  });
});

describe("mapWorkoutSet", () => {
  it("maps a working set", () => {
    const rec = {
      id: "w1",
      fields: {
        Exercise: "Back Squat",
        Date: "2026-06-28",
        Set: 1,
        Reps: 5,
        "Weight lb": 245,
        Notes: "felt heavy",
      },
    };
    expect(mapWorkoutSet(rec)).toEqual({
      id: "w1",
      exercise: "Back Squat",
      date: "2026-06-28",
      set: 1,
      reps: 5,
      weightLb: 245,
      notes: "felt heavy",
    });
  });
});

describe("mapMealItem", () => {
  it("maps a food portion", () => {
    const rec = {
      id: "i1",
      fields: {
        "Item Entry": "NTD Meal 3 — Avocado",
        "Day Type": "Non-Training Day",
        "Meal Slot": "Meal 3",
        Food: "Avocado",
        "Amount g": 58,
        State: "raw",
        "Option Group": "Fat option",
        Notes: "OR 9g olive oil",
      },
    };
    expect(mapMealItem(rec)).toEqual({
      id: "i1",
      entry: "NTD Meal 3 — Avocado",
      dayType: "Non-Training Day",
      mealSlot: "Meal 3",
      food: "Avocado",
      amountG: 58,
      state: "raw",
      optionGroup: "Fat option",
      notes: "OR 9g olive oil",
    });
  });
});
