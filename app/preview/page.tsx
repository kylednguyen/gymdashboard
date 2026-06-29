// TEMPORARY preview route — verifies the interactive Log (What I ate + expandable rows).
import { AppShell } from "@/components/AppShell";
import { CheckIn, DailyTarget, MealItem, MealTemplate, WorkoutSet } from "@/lib/types";

const targets: DailyTarget[] = [
  { id: "td", name: "Training Day", dayType: "Training Day", calories: 2063, proteinG: 177, carbsG: 212, fatG: 53 },
  { id: "ntd", name: "Non-Training Day", dayType: "Non-Training Day", calories: 1535, proteinG: 166, carbsG: 84, fatG: 59 },
];

const checkIns: CheckIn[] = [
  { id: "c1", date: "2026-06-28", dayType: "Non-Training Day", bodyweightLb: 167, caloriesLogged: 1190, proteinG: 105, carbsG: 57, fatG: 56, workout: false, notes: "Meal: Turkey Rice Skillet. Estimated from 1 lb ground turkey, 2 eggs, olive oil, 1 cup rice, and a medium red onion.\n\nDay marked as Non-Training / rest day." },
  { id: "c2", date: "2026-06-24", dayType: "Training Day", bodyweightLb: 168.2, caloriesLogged: 2040, proteinG: 175, carbsG: 205, fatG: 52, steps: 11200, workout: true, notes: "Pre: white rice + chicken. Post: rice + chicken. Shake with oats, whey, berries." },
];

export default function PreviewPage() {
  return (
    <AppShell
      data={{ checkIns, targets, mealTemplates: [], mealItems: [], workoutSets: [] }}
      today="2026-06-29"
    />
  );
}
