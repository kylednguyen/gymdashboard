import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DayTypeToggle } from "@/components/DayTypeToggle";
import { MealsTab } from "@/components/MealsTab";
import { DailyTarget, MealItem, MealTemplate } from "@/lib/types";

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
    { id: "td", name: "TD", dayType: "Training Day", calories: 2063, proteinG: 177, carbsG: 212, fatG: 53 },
  ];
  const templates: MealTemplate[] = [
    { id: "t1", name: "TD — Shake", dayType: "Training Day", mealSlot: "Shake", timing: "Anytime" },
  ];
  const items: MealItem[] = [
    { id: "i1", entry: "TD Shake — Oats", dayType: "Training Day", mealSlot: "Shake", food: "Oats", amountG: 35 },
  ];

  it("shows the day's target and meal slots", () => {
    render(
      <MealsTab
        templates={templates}
        items={items}
        targets={targets}
        dayType="Training Day"
        onDayType={() => {}}
      />
    );
    expect(screen.getByText("2063 kcal")).toBeTruthy();
    expect(screen.getByText("Shake")).toBeTruthy();
    // First slot is expanded by default, so its item is visible.
    expect(screen.getByText("35 g Oats")).toBeTruthy();
  });
});
