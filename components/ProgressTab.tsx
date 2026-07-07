"use client";
import { useState } from "react";
import { CheckIn, DailyTarget, UNIT_WEIGHT } from "@/lib/types";
import {
  caloriesVsTargetSeries,
  latestWeight,
  weeklyAverages,
  weightSeries,
  withinDays,
} from "@/lib/metrics";
import { WeightTrend } from "./WeightTrend";
import { CaloriesChart } from "./CaloriesChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const RANGES: { id: string; label: string; days: number | null }[] = [
  { id: "1w", label: "1W", days: 7 },
  { id: "1m", label: "1M", days: 30 },
  { id: "3m", label: "3M", days: 90 },
  { id: "all", label: "All", days: null },
];

function RangePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <Tabs value={value} onValueChange={onChange} aria-label="Time range">
      <TabsList className="flex w-full">
        {RANGES.map((r) => (
          <TabsTrigger key={r.id} value={r.id}>
            {r.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card className="gap-0 py-4">
      <CardContent className="px-4">
        <div className="text-xs font-semibold text-muted-foreground">{label}</div>
        <div className="tnum mt-1 text-xl font-bold">{value}</div>
        {sub && <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}

export function ProgressTab({
  checkIns,
  targets,
  today,
}: {
  checkIns: CheckIn[];
  targets: DailyTarget[];
  today: string;
}) {
  const [rangeId, setRangeId] = useState("all");
  const days = RANGES.find((r) => r.id === rangeId)?.days ?? null;

  const weight = latestWeight(checkIns);
  const series = withinDays(weightSeries(checkIns), today, days);
  const calories = withinDays(caloriesVsTargetSeries(checkIns, targets), today, days);
  const avgs = weeklyAverages(checkIns, today, days ?? 100_000);

  // Weight change across the visible range (first vs last reading).
  const delta =
    series.length >= 2 ? series[series.length - 1].weight - series[0].weight : null;
  const deltaLabel =
    delta === null ? "—" : `${delta > 0 ? "+" : ""}${Math.round(delta * 10) / 10}`;

  // On-target days: logged calories within 5% of that day's target.
  const withTarget = calories.filter((c) => c.target !== null);
  const onTarget = withTarget.filter(
    (c) => Math.abs(c.logged - (c.target as number)) <= (c.target as number) * 0.05
  ).length;

  return (
    <div className="flex flex-col gap-4">
      <RangePicker value={rangeId} onChange={setRangeId} />

      <div key={rangeId} className="animate-fade flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Stat
            label="Current weight"
            value={weight === null ? "—" : `${weight} ${UNIT_WEIGHT}`}
            sub={`${series.length} reading${series.length === 1 ? "" : "s"} in range`}
          />
          <Stat
            label="Change"
            value={delta === null ? "—" : `${deltaLabel} ${UNIT_WEIGHT}`}
            sub={delta === null ? "Need 2+ readings" : "First vs last in range"}
          />
          <Stat
            label="Avg calories"
            value={avgs.calories === null ? "—" : `${avgs.calories}`}
            sub={
              withTarget.length > 0
                ? `${onTarget}/${withTarget.length} days within 5% of target`
                : undefined
            }
          />
          <Stat
            label="Avg protein"
            value={avgs.proteinG === null ? "—" : `${avgs.proteinG} g`}
            sub={`${avgs.daysLogged} day${avgs.daysLogged === 1 ? "" : "s"} logged`}
          />
        </div>

        <WeightTrend data={series} />

        <Card className="gap-3">
          <CardHeader>
            <CardTitle>Calories vs target</CardTitle>
          </CardHeader>
          <CardContent>
            <CaloriesChart data={calories} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
