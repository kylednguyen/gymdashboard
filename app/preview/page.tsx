// TEMPORARY preview route — reproduces the real bug scenario (today has no
// check-in; most recent logged day is the day before). Safe to delete.
import { AppShell } from "@/components/AppShell";
import { CheckIn, DailyTarget, MealItem, MealTemplate, WorkoutSet } from "@/lib/types";

const targets: DailyTarget[] = [
  { id: "td", name: "Training Day", dayType: "Training Day", calories: 2063, proteinG: 177, carbsG: 212, fatG: 53 },
  { id: "ntd", name: "Non-Training Day", dayType: "Non-Training Day", calories: 1535, proteinG: 166, carbsG: 84, fatG: 59 },
];

const mealTemplates: MealTemplate[] = [];
const mealItems: MealItem[] = [];
const workoutSets: WorkoutSet[] = [];

// Mirrors the real Check-In: 2026-06-28, Non-Training, 1190 kcal, 167 lb.
const checkIns: CheckIn[] = [
  { id: "c1", date: "2026-06-28", dayType: "Non-Training Day", bodyweightLb: 167, caloriesLogged: 1190, proteinG: 105, carbsG: 57, fatG: 56, workout: false, notes: "Turkey Rice Skillet." },
];

export default function PreviewPage() {
  // today is 2026-06-29 — no check-in for today, so the Log should fall back to 06-28.
  return (
    <AppShell
      data={{ checkIns, targets, mealTemplates, mealItems, workoutSets }}
      today="2026-06-29"
    />
  );
}
