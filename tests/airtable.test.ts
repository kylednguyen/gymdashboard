import { describe, it, expect, vi, beforeEach } from "vitest";

// server-only throws outside Next.js (it's replaced by SWC in real builds).
// Mock it as a no-op so Vitest can import lib/airtable.ts.
vi.mock("server-only", () => ({}));

// Mock the airtable SDK before importing the module under test.
const selectAll = vi.fn();
const table = vi.fn(() => ({ select: () => ({ all: selectAll }) }));
const base = vi.fn(() => table);
vi.mock("airtable", () => ({
  default: class {
    base() {
      return base();
    }
  },
}));

beforeEach(() => {
  vi.resetModules();
  process.env.AIRTABLE_PAT = "pat";
  process.env.AIRTABLE_BASE_ID = "appX";
  selectAll.mockReset();
});

describe("getCheckIns", () => {
  it("returns mapped check-ins and skips empty rows", async () => {
    selectAll.mockResolvedValue([
      {
        id: "c1",
        fields: { "Check-in Date": "2026-06-28", "Bodyweight lb": 182, Workout: true },
      },
      { id: "blank", fields: {} },
    ]);
    const { getCheckIns } = await import("@/lib/airtable");
    const result = await getCheckIns();
    expect(result).toEqual([
      { id: "c1", date: "2026-06-28", bodyweightLb: 182, workout: true },
    ]);
  });
});

describe("getDailyTargets", () => {
  it("returns mapped targets", async () => {
    selectAll.mockResolvedValue([
      {
        id: "t1",
        fields: {
          "Target Name": "TD",
          "Day Type": "Training Day",
          Calories: 2063,
          "Protein g": 177,
          "Carbs g": 212,
          "Fat g": 53,
        },
      },
    ]);
    const { getDailyTargets } = await import("@/lib/airtable");
    const result = await getDailyTargets();
    expect(result).toEqual([
      {
        id: "t1",
        name: "TD",
        dayType: "Training Day",
        calories: 2063,
        proteinG: 177,
        carbsG: 212,
        fatG: 53,
      },
    ]);
  });
});
