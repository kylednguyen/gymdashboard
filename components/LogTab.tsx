import { CheckIn, DailyTarget, DayType } from "@/lib/types";
import {
  checkInForDate,
  consumedMacros,
  dayTypeForDate,
  targetMacrosFor,
  targetFor,
} from "@/lib/metrics";
import { Ring } from "./Ring";
import { DayTypeToggle } from "./DayTypeToggle";

interface Props {
  checkIns: CheckIn[];
  targets: DailyTarget[];
  today: string;
  dayType: DayType;
  onDayType: (d: DayType) => void;
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

function fmtDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${m}/${d}`;
}

export function LogTab({ checkIns, targets, today, dayType, onDayType }: Props) {
  const autoDayType = dayTypeForDate(checkIns, today);
  const todayCheckIn = checkInForDate(checkIns, today);
  const consumed = consumedMacros(todayCheckIn);
  const target = targetMacrosFor(targets, dayType);
  const cal = target?.calories ?? null;
  const remaining = cal !== null ? cal - consumed.calories : null;

  const logged = checkIns
    .filter((c) => c.date && c.caloriesLogged !== undefined)
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-bold">Today</h2>
        <p className="text-xs text-muted">
          {today}
          {autoDayType ? ` · logged as ${autoDayType}` : " · no check-in yet"}
        </p>
      </div>

      <DayTypeToggle value={dayType} onChange={onDayType} />

      {/* Calorie ring */}
      <section className="rounded-2xl bg-surface p-5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted">Calories</h3>
          <span className="text-xs text-muted">{dayType}</span>
        </div>
        <div className="flex flex-col items-center">
          <Ring pct={cal ? consumed.calories / cal : 0} size={200} stroke={16} color="var(--brand)">
            <span className="tnum font-condensed text-5xl font-bold leading-none">
              {remaining ?? "—"}
            </span>
            <span className="mt-1 text-xs font-medium uppercase tracking-wide text-muted">
              Remaining
            </span>
          </Ring>
          <div className="mt-4 flex w-full justify-center gap-8 text-center">
            <div>
              <div className="tnum text-base font-bold">{cal ?? "—"}</div>
              <div className="text-xs text-muted">Budget</div>
            </div>
            <div>
              <div className="tnum text-base font-bold">{consumed.calories}</div>
              <div className="text-xs text-muted">Food</div>
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

      {/* Recent calorie log */}
      <section className="rounded-2xl bg-surface p-5">
        <h3 className="mb-3 text-sm font-semibold text-muted">Recent log</h3>
        {logged.length === 0 ? (
          <p className="text-sm text-muted">No days logged yet — add a Check-In in Airtable.</p>
        ) : (
          <ul className="flex flex-col">
            {logged.map((c, i) => {
              const t = c.dayType ? targetFor(targets, c.dayType)?.calories ?? null : null;
              return (
                <li
                  key={c.id}
                  className="animate-in flex items-center justify-between border-t border-border py-2.5 first:border-t-0"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div>
                    <div className="text-sm font-semibold">{fmtDate(c.date)}</div>
                    {c.dayType && <div className="text-xs text-muted">{c.dayType}</div>}
                  </div>
                  <div className="tnum text-sm">
                    <span className="font-bold">{c.caloriesLogged}</span>
                    <span className="text-muted"> / {t ?? "—"}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
