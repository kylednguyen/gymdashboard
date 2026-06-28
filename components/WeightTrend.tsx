"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { UNIT_WEIGHT } from "@/lib/types";

interface Props {
  data: { date: string; weight: number }[];
}

export function WeightTrend({ data }: Props) {
  return (
    <section className="rounded-2xl bg-surface p-5">
      <h2 className="mb-3 text-sm font-semibold text-muted">Weight ({UNIT_WEIGHT})</h2>
      {data.length === 0 ? (
        <p className="text-sm text-muted">No weight entries yet — log a check-in to see your trend.</p>
      ) : (
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "var(--muted)" }}
                tickFormatter={(d) => d.slice(5)}
                stroke="var(--border)"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted)" }}
                domain={["auto", "auto"]}
                stroke="var(--border)"
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  color: "var(--foreground)",
                  fontSize: 12,
                }}
                labelStyle={{ color: "var(--muted)" }}
                itemStyle={{ color: "var(--foreground)" }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="var(--brand)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "var(--brand)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
