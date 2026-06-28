import { CheckIn, UNIT_WEIGHT } from "@/lib/types";
import { latestWeight, weightSeries, weeklyAverages } from "@/lib/metrics";
import { WeightTrend } from "./WeightTrend";

export function ProgressTab({ checkIns, today }: { checkIns: CheckIn[]; today: string }) {
  const weight = latestWeight(checkIns);
  const series = weightSeries(checkIns);
  const week = weeklyAverages(checkIns, today);

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-2xl bg-surface p-5">
        <div className="text-sm font-semibold text-muted">Current weight</div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="tnum font-condensed text-4xl font-bold">
            {weight === null ? "—" : weight}
          </span>
          <span className="text-lg font-semibold text-muted">{UNIT_WEIGHT}</span>
        </div>
        <div className="mt-1 text-xs text-muted">{week.daysLogged} day(s) logged this week</div>
      </section>
      <WeightTrend data={series} />
    </div>
  );
}
