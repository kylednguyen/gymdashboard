import { getDashboardData } from "@/lib/airtable";
import {
  workoutsThisWeek,
  currentStreak,
  latestWeight,
  goalsOnTrack,
  weightSeries,
  consistencyMap,
} from "@/lib/metrics";
import { KpiCards } from "@/components/KpiCards";
import { WeightTrend } from "@/components/WeightTrend";
import { GoalProgress } from "@/components/GoalProgress";
import { ConsistencyHeatmap } from "@/components/ConsistencyHeatmap";
import { RecentWorkouts } from "@/components/RecentWorkouts";

export const revalidate = 60;

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function Page() {
  let data: Awaited<ReturnType<typeof getDashboardData>>;
  try {
    data = await getDashboardData();
  } catch (e) {
    return (
      <main className="mx-auto max-w-3xl p-4">
        <h1 className="text-xl font-semibold">Fitness Dashboard</h1>
        <p className="mt-4 rounded bg-red-500/10 p-3 text-sm text-red-300">
          Could not load data: {(e as Error).message}
        </p>
      </main>
    );
  }

  const today = todayISO();
  const { workouts, bodyMetrics, goals } = data;
  const recent = workouts
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 10);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold">Fitness Dashboard</h1>
      <KpiCards
        workoutsThisWeek={workoutsThisWeek(workouts, today)}
        currentStreak={currentStreak(workouts, today)}
        latestWeight={latestWeight(bodyMetrics)}
        goalsOnTrack={goalsOnTrack(goals)}
        goalsTotal={goals.length}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <WeightTrend data={weightSeries(bodyMetrics)} />
        <GoalProgress goals={goals} />
      </div>
      <ConsistencyHeatmap data={consistencyMap(workouts, today, 35)} />
      <RecentWorkouts workouts={recent} />
    </main>
  );
}
