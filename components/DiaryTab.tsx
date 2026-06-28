import { DailyTarget, DayType, MealItem, MealTemplate } from "@/lib/types";
import { DayTypeToggle } from "./DayTypeToggle";
import { MealCard } from "./MealCard";

const SLOT_ORDER = [
  "Shake",
  "Preworkout Meal",
  "Post Workout Meal",
  "Meal 2",
  "Meal 3",
  "Meal 4",
];

function slotRank(slot: string): number {
  const i = SLOT_ORDER.indexOf(slot);
  return i === -1 ? SLOT_ORDER.length : i;
}

interface Props {
  templates: MealTemplate[];
  items: MealItem[];
  targets: DailyTarget[];
  dayType: DayType;
  onDayType: (d: DayType) => void;
}

export function DiaryTab({ templates, items, targets, dayType, onDayType }: Props) {
  const dayTemplates = templates.filter((t) => t.dayType === dayType);
  const dayItems = items.filter((i) => i.dayType === dayType);
  const slots = Array.from(
    new Set(
      [...dayTemplates.map((t) => t.mealSlot), ...dayItems.map((i) => i.mealSlot)].filter(
        Boolean
      ) as string[]
    )
  ).sort((a, b) => slotRank(a) - slotRank(b) || a.localeCompare(b));
  const target = targets.find((t) => t.dayType === dayType) ?? null;

  return (
    <div className="flex flex-col gap-4">
      <DayTypeToggle value={dayType} onChange={onDayType} />

      {target && (
        <section className="rounded-2xl bg-brand p-4 text-white">
          <div className="text-xs font-medium uppercase tracking-wide text-white/70">
            Daily target
          </div>
          <div className="tnum mt-1 text-2xl font-bold">{target.calories} kcal</div>
          <div className="tnum mt-1 text-sm text-white/85">
            {target.proteinG}P · {target.carbsG}C · {target.fatG}F
          </div>
        </section>
      )}

      <div className="flex flex-col gap-3">
        {slots.length === 0 ? (
          <p className="rounded-2xl bg-surface p-4 text-sm text-muted">
            No meals defined for this day.
          </p>
        ) : (
          slots.map((slot, idx) => {
            const tmpl = dayTemplates.find((t) => t.mealSlot === slot);
            const slotItems = dayItems.filter((i) => i.mealSlot === slot);
            return (
              <MealCard
                key={slot}
                slot={slot}
                timing={tmpl?.timing}
                items={slotItems}
                defaultOpen={idx === 0}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
