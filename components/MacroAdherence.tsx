import { LoggedDay } from "@/lib/metrics";

function Bar({
  label,
  logged,
  target,
  unit,
}: {
  label: string;
  logged: number;
  target: number | null;
  unit: string;
}) {
  const pct =
    target && target > 0 ? Math.min(100, Math.round((logged / target) * 100)) : 0;
  // Tint amber when meaningfully over the target, sky otherwise.
  const over = target !== null && logged > target * 1.05;
  return (
    <li>
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-neutral-400">
          {logged}
          {target !== null ? ` / ${target}` : ""} {unit}
        </span>
      </div>
      <div className="mt-1 h-2 rounded bg-white/10">
        <div
          className={`h-2 rounded ${over ? "bg-amber-400" : "bg-sky-400"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </li>
  );
}

export function MacroAdherence({ day }: { day: LoggedDay | null }) {
  return (
    <section className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-medium text-neutral-300">
          Calories &amp; macros vs target
        </h2>
        {day && (
          <span className="text-xs text-neutral-500">
            {day.date}
            {day.dayType ? ` · ${day.dayType}` : ""}
          </span>
        )}
      </div>
      {!day ? (
        <p className="text-sm text-neutral-500">No nutrition logged yet.</p>
      ) : (
        <ul className="space-y-3">
          <Bar
            label="Calories"
            logged={day.logged.calories}
            target={day.target?.calories ?? null}
            unit="kcal"
          />
          <Bar
            label="Protein"
            logged={day.logged.proteinG}
            target={day.target?.proteinG ?? null}
            unit="g"
          />
          <Bar
            label="Carbs"
            logged={day.logged.carbsG}
            target={day.target?.carbsG ?? null}
            unit="g"
          />
          <Bar
            label="Fat"
            logged={day.logged.fatG}
            target={day.target?.fatG ?? null}
            unit="g"
          />
        </ul>
      )}
    </section>
  );
}
