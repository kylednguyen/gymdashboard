import { getDashboardData } from "@/lib/airtable";
import {
  weightSeries,
  latestWeight,
  latestLoggedDay,
  weeklyAverages,
} from "@/lib/metrics";
import { KpiCards } from "@/components/KpiCards";
import { WeightTrend } from "@/components/WeightTrend";
import { MacroAdherence } from "@/components/MacroAdherence";
import { MealPlan } from "@/components/MealPlan";

export const revalidate = 60;

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function Page() {
  let data: Awaited<ReturnType<typeof getDashboardData>>;
  try {
    data = await getDashboardData();
  } catch (e) {
    // Log the real cause server-side only; never surface backend details
    // (base id, table names, Airtable auth errors) to the browser.
    console.error("Dashboard data fetch failed:", e);
    return (
      <main className="mx-auto max-w-3xl p-4">
        <h1 className="text-xl font-semibold">Gym Dashboard</h1>
        <p className="mt-4 rounded bg-red-500/10 p-3 text-sm text-red-300">
          Could not load data right now. Please try again later.
        </p>
      </main>
    );
  }

  const today = todayISO();
  const { checkIns, targets, mealTemplates, mealItems } = data;
  const week = weeklyAverages(checkIns, today);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold">Gym Dashboard</h1>
      <KpiCards
        latestWeight={latestWeight(checkIns)}
        daysLogged={week.daysLogged}
        avgCalories={week.calories}
        avgProtein={week.proteinG}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <WeightTrend data={weightSeries(checkIns)} />
        <MacroAdherence day={latestLoggedDay(checkIns, targets)} />
      </div>
      <MealPlan targets={targets} templates={mealTemplates} items={mealItems} />
    </main>
  );
}
