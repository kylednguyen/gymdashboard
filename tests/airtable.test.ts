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

describe("getWorkouts", () => {
  it("returns mapped workouts", async () => {
    selectAll.mockResolvedValue([
      { id: "rec1", fields: { Date: "2026-06-20", Type: "Strength", Duration: 45 } },
    ]);
    const { getWorkouts } = await import("@/lib/airtable");
    const result = await getWorkouts();
    expect(result).toEqual([
      { id: "rec1", date: "2026-06-20", type: "Strength", durationMin: 45 },
    ]);
  });
});
