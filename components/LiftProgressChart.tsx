"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  data: { date: string; weight: number }[];
}

export function LiftProgressChart({ data }: Props) {
  if (data.length === 0) {
    return <p className="text-sm text-muted">No weight logged for this lift yet.</p>;
  }
  return (
    <div className="h-52 w-full">
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
            width={44}
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
            formatter={(v) => [`${v} lb`, "Top set"]}
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
  );
}
