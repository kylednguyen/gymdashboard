"use client";
import {
  Bar,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  data: { date: string; logged: number; target: number | null }[];
}

/** Logged calories per day (bars) against that day's target (dashed line). */
export function CaloriesChart({ data }: Props) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No calories logged in this range.</p>;
  }
  return (
    <div className="w-full">
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 5, right: 10, bottom: 5, left: -16 }}
            barCategoryGap="25%"
          >
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickFormatter={(d) => d.slice(5)}
              stroke="var(--border)"
            />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} stroke="var(--border)" />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "var(--card)",
                color: "var(--foreground)",
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--muted-foreground)" }}
              itemStyle={{ color: "var(--foreground)" }}
              formatter={(v, name) => [`${v} kcal`, name === "logged" ? "Logged" : "Target"]}
            />
            <Bar dataKey="logged" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Line
              type="stepAfter"
              dataKey="target"
              stroke="var(--muted-foreground)"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={{ r: 3, fill: "var(--muted-foreground)", strokeWidth: 0 }}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-[3px] bg-primary" /> Logged
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-0.5 w-4 rounded"
            style={{ background: "var(--muted-foreground)" }}
          />
          Target
        </span>
      </div>
    </div>
  );
}
