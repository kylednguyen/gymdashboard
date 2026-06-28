"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { UNIT_WEIGHT } from "@/lib/types";

interface Props {
  data: { date: string; weight: number }[];
}

export function WeightTrend({ data }: Props) {
  return (
    <section className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
      <h2 className="mb-3 text-sm font-medium text-neutral-300">Weight ({UNIT_WEIGHT})</h2>
      {data.length === 0 ? (
        <p className="text-sm text-neutral-500">No weight entries yet.</p>
      ) : (
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke="#38bdf8" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
