import { Goal } from "@/lib/types";

export function GoalProgress({ goals }: { goals: Goal[] }) {
  return (
    <section className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
      <h2 className="mb-3 text-sm font-medium text-neutral-300">Goals</h2>
      {goals.length === 0 ? (
        <p className="text-sm text-neutral-500">No goals yet.</p>
      ) : (
        <ul className="space-y-3">
          {goals.map((g) => {
            const pct = g.targetValue > 0 ? Math.min(100, Math.round((g.currentValue / g.targetValue) * 100)) : 0;
            return (
              <li key={g.id}>
                <div className="flex justify-between text-sm">
                  <span>{g.name}</span>
                  <span className="text-neutral-400">
                    {g.currentValue}/{g.targetValue} {g.unit}
                  </span>
                </div>
                <div className="mt-1 h-2 rounded bg-white/10">
                  <div className="h-2 rounded bg-sky-400" style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
