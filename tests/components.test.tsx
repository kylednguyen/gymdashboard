import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

// RTL auto-cleanup needs vitest globals, which this config doesn't enable.
afterEach(cleanup);

// Radix tab triggers activate on pointerdown, not click.
function pressTab(el: Element) {
  fireEvent.mouseDown(el, { button: 0 });
  fireEvent.click(el);
}
import { DayTypeToggle } from "@/components/DayTypeToggle";
import { MealsTab } from "@/components/MealsTab";
import { CheckIn, DailyTarget, MealItem, MealTemplate } from "@/lib/types";

describe("DayTypeToggle", () => {
  it("renders both options and reports the selected one", () => {
    const onChange = vi.fn();
    render(<DayTypeToggle value="Training Day" onChange={onChange} />);
    const training = screen.getByRole("tab", { name: "Training" });
    expect(training.getAttribute("aria-selected")).toBe("true");
    pressTab(screen.getByRole("tab", { name: "Non-Training" }));
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

  const mealTemplates: MealTemplate[] = [
    {
      id: "m1",
      name: "NTD — Shake",
      dayType: "Non-Training Day",
      mealSlot: "Shake",
      timing: "Anytime",
      notes: "Reduced oats, whey isolate, berries.",
    },
  ];
  const mealItems: MealItem[] = [
    {
      id: "i1",
      entry: "NTD Shake — Oats",
      dayType: "Non-Training Day",
      mealSlot: "Shake",
      food: "Oats",
      amountG: 18,
    },
  ];
  const props = { checkIns, targets, mealTemplates, mealItems, today: "2026-06-28" };

  it("defaults to the meal plan for today's day type", () => {
    render(<MealsTab {...props} />);
    // today's check-in is Non-Training → NTD plan pre-selected with its slot + target
    expect(screen.getByRole("tab", { name: "Non-Training" }).getAttribute("aria-selected")).toBe(
      "true"
    );
    expect(screen.getByText("Shake")).toBeTruthy();
    expect(screen.getByText("1535")).toBeTruthy();
    expect(screen.getByText(/18 g Oats/)).toBeTruthy();
  });

  it("lists what was eaten per day with calories vs target", () => {
    render(<MealsTab {...props} />);
    pressTab(screen.getByRole("tab", { name: "Eaten" }));
    expect(screen.getByText("Turkey Rice Skillet")).toBeTruthy();
    expect(screen.getByText("1190")).toBeTruthy();
    expect(screen.getByText("105g protein")).toBeTruthy();
  });

  it("shows an empty state when nothing is logged", () => {
    render(<MealsTab {...props} checkIns={[]} />);
    pressTab(screen.getByRole("tab", { name: "Eaten" }));
    expect(screen.getByText(/No meals logged yet/)).toBeTruthy();
  });
});
