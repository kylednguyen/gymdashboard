// TEMPORARY preview route — exercises every screen with sample data shaped like
// the real "Aggregate Gym Profile" base (no Airtable env vars needed).
import { AppShell } from "@/components/AppShell";
import { CheckIn, DailyTarget, MealItem, MealTemplate, WorkoutSet } from "@/lib/types";

const targets: DailyTarget[] = [
  { id: "td", name: "Training Day", dayType: "Training Day", calories: 2063, proteinG: 177, carbsG: 212, fatG: 53 },
  { id: "ntd", name: "Non-Training Day", dayType: "Non-Training Day", calories: 1535, proteinG: 166, carbsG: 84, fatG: 59 },
];

const checkIns: CheckIn[] = [
  { id: "c1", date: "2026-06-28", dayType: "Non-Training Day", bodyweightLb: 167, caloriesLogged: 2140, proteinG: 160, carbsG: 122, fatG: 106, workout: false, notes: "Meal: Turkey Rice Skillet. Estimated from 1 lb ground turkey, 2 eggs, olive oil, 1 cup rice, and a medium red onion." },
  { id: "c2", date: "2026-06-24", dayType: "Training Day", bodyweightLb: 168.2, caloriesLogged: 2040, proteinG: 175, carbsG: 205, fatG: 52, steps: 11200, workout: true, notes: "Pre: white rice + chicken. Post: rice + chicken. Shake with oats, whey, berries." },
  // Mirrors the live check-in whose Day Type select is the bare "Training" choice
  // (mapper normalizes it to "Training Day" before it reaches the UI).
  { id: "c3", date: "2026-06-29", dayType: "Training Day", caloriesLogged: 1120, proteinG: 85, carbsG: 76, fatG: 48.5, workout: true, notes: "Outshine bar + Fairlife shake, chicken leg quarter, 200g basmati rice." },
];

const mealTemplates: MealTemplate[] = [
  { id: "m1", name: "TD — Shake", dayType: "Training Day", mealSlot: "Shake", timing: "Anytime", notes: "Oats, whey isolate, berries, peanut butter." },
  { id: "m2", name: "TD — Preworkout Meal", dayType: "Training Day", mealSlot: "Preworkout Meal", timing: "1 hr prior", notes: "White rice, chicken breast, olive oil or avocado." },
  { id: "m3", name: "TD — Post Workout Meal", dayType: "Training Day", mealSlot: "Post Workout Meal", timing: "Post workout", notes: "White rice, chicken breast, olive oil or avocado." },
  { id: "m4", name: "TD — Meal 4", dayType: "Training Day", mealSlot: "Meal 4", timing: "Later meal", notes: "Sweet potato, flank steak, olive oil or avocado." },
  { id: "m5", name: "NTD — Shake", dayType: "Non-Training Day", mealSlot: "Shake", timing: "Anytime", notes: "Reduced oats, whey isolate, berries, peanut butter." },
  { id: "m6", name: "NTD — Meal 2", dayType: "Non-Training Day", mealSlot: "Meal 2", timing: "Meal 2", notes: "Red skin potato, chicken breast, olive oil or avocado." },
];

const mealItems: MealItem[] = [
  { id: "i1", entry: "TD Shake — Oats", dayType: "Training Day", mealSlot: "Shake", food: "Oats", amountG: 35 },
  { id: "i2", entry: "TD Shake — Whey Isolate", dayType: "Training Day", mealSlot: "Shake", food: "Whey Isolate", amountG: 44 },
  { id: "i3", entry: "TD Shake — Blueberries", dayType: "Training Day", mealSlot: "Shake", food: "Blueberries", amountG: 88 },
  { id: "i4", entry: "TD Preworkout — White Rice", dayType: "Training Day", mealSlot: "Preworkout Meal", food: "White Rice", amountG: 195, state: "cooked" },
  { id: "i5", entry: "TD Preworkout — Chicken Breast", dayType: "Training Day", mealSlot: "Preworkout Meal", food: "Chicken Breast", amountG: 133, state: "cooked" },
  { id: "i6", entry: "TD Preworkout — Olive Oil", dayType: "Training Day", mealSlot: "Preworkout Meal", food: "Olive Oil", amountG: 5, optionGroup: "Fat option", notes: "OR 29g avocado" },
  { id: "i7", entry: "TD Post Workout — White Rice", dayType: "Training Day", mealSlot: "Post Workout Meal", food: "White Rice", amountG: 195, state: "cooked" },
  { id: "i8", entry: "TD Meal 4 — Flank Steak", dayType: "Training Day", mealSlot: "Meal 4", food: "Flank Steak", amountG: 135, state: "cooked" },
  { id: "i9", entry: "NTD Shake — Oats", dayType: "Non-Training Day", mealSlot: "Shake", food: "Oats", amountG: 18 },
  { id: "i10", entry: "NTD Meal 2 — Red Skin Potato", dayType: "Non-Training Day", mealSlot: "Meal 2", food: "Red Skin Potato", amountG: 133, state: "raw" },
  { id: "i11", entry: "NTD Meal 2 — Avocado", dayType: "Non-Training Day", mealSlot: "Meal 2", food: "Avocado", amountG: 58, optionGroup: "Fat option", notes: "OR 9g olive oil" },
];

const workoutSets: WorkoutSet[] = [
  { id: "w1", date: "2026-06-14", exercise: "Back Squat", set: 1, reps: 5, weightLb: 225 },
  { id: "w2", date: "2026-06-21", exercise: "Back Squat", set: 1, reps: 5, weightLb: 235 },
  { id: "w3", date: "2026-06-28", exercise: "Back Squat", set: 1, reps: 5, weightLb: 245 },
  { id: "w4", date: "2026-06-28", exercise: "Back Squat", set: 2, reps: 4, weightLb: 245 },
  { id: "w5", date: "2026-06-28", exercise: "Romanian Deadlift", set: 1, reps: 8, weightLb: 185 },
  { id: "w6", date: "2026-06-28", exercise: "Leg Press", set: 1, reps: 10, weightLb: 360 },
];

export default function PreviewPage() {
  return (
    <AppShell
      data={{ checkIns, targets, mealTemplates, mealItems, workoutSets }}
      today="2026-06-29"
    />
  );
}
