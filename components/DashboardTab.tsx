import { CheckIn, DailyTarget, DayType, UNIT_WEIGHT } from "@/lib/types";
import { dayBudget, latestWeight, weeklyAverages } from "@/lib/metrics";
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface p-4">
      <div className="tnum text-2xl font-bold tracking-tight">{value}</div>
      <div className="text-xs font-medium text-muted">{label}</div>
    </div>
  );
}

export function DashboardTab({ checkIns, targets, today, dayType, onDayType }: Props) {
  const budget = dayBudget(checkIns, targets, dayType);
  const week = weeklyAverages(checkIns, today);
  const weight = latestWeight(checkIns);
  const cal = budget.target?.calories ?? null;
  const remaining = cal !== null ? cal - budget.consumed.calories : null;

  return (
    <div className="flex flex-col gap-4">
      <DayTypeToggle value={dayType} onChange={onDayType} />

      {/* Calorie hero */}
      <section className="rounded-2xl bg-surface p-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted">Calories</h2>
          <span className="text-xs text-muted">
            {budget.loggedDate ? `Logged ${budget.loggedDate.slice(5)}` : "Plan target"}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <Ring pct={cal ? budget.consumed.calories / cal : 0} size={200} stroke={16} color="var(--brand)">
            <span className="tnum font-condensed text-5xl font-bold leading-none text-foreground">
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
              <div className="tnum text-base font-bold">{budget.consumed.calories}</div>
              <div className="text-xs text-muted">Food</div>
            </div>
          </div>
        </div>
      </section>

      {/* Macros */}
      <section className="rounded-2xl bg-surface p-5">
        <h2 className="mb-4 text-sm font-semibold text-muted">Macros</h2>
        <div className="flex justify-around">
          <MacroRing label="Carbs" consumed={budget.consumed.carbsG} target={budget.target?.carbsG ?? null} color="var(--carbs)" />
          <MacroRing label="Protein" consumed={budget.consumed.proteinG} target={budget.target?.proteinG ?? null} color="var(--protein)" />
          <MacroRing label="Fat" consumed={budget.consumed.fatG} target={budget.target?.fatG ?? null} color="var(--fat)" />
        </div>
      </section>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Latest weight" value={weight === null ? "—" : `${weight} ${UNIT_WEIGHT}`} />
        <Stat label="Avg calories (7d)" value={week.calories === null ? "—" : String(week.calories)} />
      </div>
    </div>
  );
}
