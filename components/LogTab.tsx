import { CheckIn, DailyTarget } from "@/lib/types";
import {
  currentCheckIn,
  consumedMacros,
  targetMacrosFor,
  targetFor,
} from "@/lib/metrics";
import { Ring } from "./Ring";
import { LogEntry } from "./LogEntry";

interface Props {
  checkIns: CheckIn[];
  targets: DailyTarget[];
  today: string;
}

function MacroRing({
  label,
  consumed,
  target,
  color,
}: {
  label: string;
  consumed: number;
  target: number | null;
  color: string;
}) {
  const pct = target && target > 0 ? consumed / target : 0;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <Ring pct={pct} size={72} stroke={8} color={color}>
        <span className="tnum text-sm font-bold" style={{ color }}>
          {consumed}
        </span>
      </Ring>
      <div className="text-center">
        <div className="text-xs font-semibold text-foreground">{label}</div>
        <div className="tnum text-[11px] text-muted">
          {consumed} / {target ?? "—"} g
        </div>
      </div>
    </div>
  );
}

function fmtLong(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function LogTab({ checkIns, targets, today }: Props) {
  const current = currentCheckIn(checkIns, today);
  const isToday = current?.date === today;
  const dayType = current?.dayType ?? null;
  const consumed = consumedMacros(current);
  const target = dayType ? targetMacrosFor(targets, dayType) : null;
  const cal = target?.calories ?? null;
  const remaining = cal !== null ? cal - consumed.calories : null;

  const logged = checkIns
    .filter((c) => c.date && c.caloriesLogged !== undefined)
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold">{isToday ? "Today" : "Latest"}</h2>
          <p className="text-xs text-muted">{current ? fmtLong(current.date) : today}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            dayType ? "bg-brand/15 text-brand" : "bg-white/5 text-muted"
          }`}
        >
          {dayType ?? (current ? "Day type not set" : "No check-ins")}
        </span>
      </div>

      {/* Calories consumed */}
      <section className="rounded-2xl bg-surface p-5">
        <h3 className="mb-2 text-sm font-semibold text-muted">Calories consumed</h3>
        <div className="flex flex-col items-center">
          <Ring pct={cal ? consumed.calories / cal : 0} size={200} stroke={16} color="var(--brand)">
            <span className="tnum font-condensed text-5xl font-bold leading-none">
              {consumed.calories}
            </span>
            <span className="mt-1 text-xs font-medium uppercase tracking-wide text-muted">
              Consumed
            </span>
          </Ring>
          <div className="mt-4 flex w-full justify-center gap-8 text-center">
            <div>
              <div className="tnum text-base font-bold">{cal ?? "—"}</div>
              <div className="text-xs text-muted">Target</div>
            </div>
            <div>
              <div className="tnum text-base font-bold">{remaining ?? "—"}</div>
              <div className="text-xs text-muted">Remaining</div>
            </div>
          </div>
        </div>
      </section>

      {/* Macros */}
      <section className="rounded-2xl bg-surface p-5">
        <h3 className="mb-4 text-sm font-semibold text-muted">Macros</h3>
        <div className="flex justify-around">
          <MacroRing label="Carbs" consumed={consumed.carbsG} target={target?.carbsG ?? null} color="var(--carbs)" />
          <MacroRing label="Protein" consumed={consumed.proteinG} target={target?.proteinG ?? null} color="var(--protein)" />
          <MacroRing label="Fat" consumed={consumed.fatG} target={target?.fatG ?? null} color="var(--fat)" />
        </div>
      </section>

      {/* What I ate (featured day) */}
      {current?.notes && (
        <section className="rounded-2xl bg-surface p-5">
          <h3 className="mb-2 text-sm font-semibold text-muted">What I ate</h3>
          <p className="whitespace-pre-line text-sm text-foreground">{current.notes}</p>
        </section>
      )}

      {/* Recent calorie log — tap a day to see what you ate */}
      <section className="rounded-2xl bg-surface p-5">
        <h3 className="mb-1 text-sm font-semibold text-muted">Recent log</h3>
        {logged.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No days logged yet — add a Check-In in Airtable.</p>
        ) : (
          <div className="flex flex-col">
            {logged.map((c) => (
              <LogEntry
                key={c.id}
                c={c}
                targetCalories={c.dayType ? targetFor(targets, c.dayType)?.calories ?? null : null}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
