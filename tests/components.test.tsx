import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DayTypeToggle } from "@/components/DayTypeToggle";
import { MealsTab } from "@/components/MealsTab";
import { CheckIn, DailyTarget } from "@/lib/types";

describe("DayTypeToggle", () => {
  it("renders both options and reports the selected one", () => {
    const onChange = vi.fn();
    render(<DayTypeToggle value="Training Day" onChange={onChange} />);
    const training = screen.getByRole("tab", { name: "Training" });
    expect(training.getAttribute("aria-selected")).toBe("true");
    fireEvent.click(screen.getByRole("tab", { name: "Non-Training" }));
    expect(onChange).toHaveBeenCalledWith("Non-Training Day");
  });
});

describe("MealsTab", () => {
  const targets: DailyTarget[] = [
    { id: "ntd", name: "NTD", dayType: "Non-Training Day", calories: 1535, proteinG: 166, carbsG: 84, fatG: 59 },
  ];
  const checkIns: CheckIn[] = [
    {
      id: "c1",
      date: "2026-06-28",
      dayType: "Non-Training Day",
      caloriesLogged: 1190,
      proteinG: 105,
      workout: false,
      notes: "Turkey Rice Skillet",
    },
  ];

  it("lists what was eaten per day with calories vs target", () => {
    render(<MealsTab checkIns={checkIns} targets={targets} />);
    expect(screen.getByText("Turkey Rice Skillet")).toBeTruthy();
    expect(screen.getByText("1190")).toBeTruthy();
    expect(screen.getByText("105g protein")).toBeTruthy();
  });

  it("shows an empty state when nothing is logged", () => {
    render(<MealsTab checkIns={[]} targets={targets} />);
    expect(screen.getByText(/No meals logged yet/)).toBeTruthy();
  });
});
