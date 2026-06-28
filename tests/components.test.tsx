import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KpiCards } from "@/components/KpiCards";
import { MacroAdherence } from "@/components/MacroAdherence";

describe("KpiCards", () => {
  it("renders values and an em dash for missing weight", () => {
    render(
      <KpiCards latestWeight={null} daysLogged={4} avgCalories={1850} avgProtein={172} />
    );
    expect(screen.getByText("—")).toBeTruthy();
    expect(screen.getByText("4")).toBeTruthy();
    expect(screen.getByText("1850")).toBeTruthy();
    expect(screen.getByText("172 g")).toBeTruthy();
  });
});

describe("MacroAdherence", () => {
  it("shows an empty state when no day is logged", () => {
    render(<MacroAdherence day={null} />);
    expect(screen.getByText("No nutrition logged yet.")).toBeTruthy();
  });

  it("shows logged vs target calories", () => {
    render(
      <MacroAdherence
        day={{
          date: "2026-06-28",
          dayType: "Training Day",
          logged: { calories: 2100, proteinG: 180, carbsG: 210, fatG: 55 },
          target: { calories: 2063, proteinG: 177, carbsG: 212, fatG: 53 },
        }}
      />
    );
    expect(screen.getByText("2100 / 2063 kcal")).toBeTruthy();
  });
});
