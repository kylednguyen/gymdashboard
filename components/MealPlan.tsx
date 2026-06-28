import { DailyTarget, DayType, MealItem, MealTemplate } from "@/lib/types";

const DAY_TYPES: DayType[] = ["Training Day", "Non-Training Day"];

// Rough chronological order of meal slots; unknown slots sort to the end.
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

function itemLabel(it: MealItem): string {
  const amount = it.amountG !== undefined ? `${it.amountG} g ` : "";
  const state = it.state && it.state !== "not specified" ? ` (${it.state})` : "";
  return `${amount}${it.food}${state}`;
}

function DayColumn({
  dayType,
  target,
  templates,
  items,
}: {
  dayType: DayType;
  target: DailyTarget | null;
  templates: MealTemplate[];
  items: MealItem[];
}) {
  const slots = Array.from(
    new Set([
      ...templates.map((t) => t.mealSlot).filter(Boolean),
      ...items.map((i) => i.mealSlot).filter(Boolean),
    ] as string[])
  ).sort((a, b) => slotRank(a) - slotRank(b) || a.localeCompare(b));

  return (
    <div className="rounded-lg bg-white/5 p-3 ring-1 ring-white/10">
      <div className="flex items-baseline justify-between">
        <h3 className="font-medium">{dayType}</h3>
        {target && (
          <span className="text-xs text-neutral-400">
            {target.calories} kcal · {target.proteinG}P / {target.carbsG}C /{" "}
            {target.fatG}F
          </span>
        )}
      </div>
      <ul className="mt-3 space-y-3">
        {slots.map((slot) => {
          const tmpl = templates.find((t) => t.mealSlot === slot);
          const slotItems = items.filter((i) => i.mealSlot === slot);
          return (
            <li key={slot}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium text-neutral-200">{slot}</span>
                {tmpl?.timing && (
                  <span className="text-xs text-neutral-500">{tmpl.timing}</span>
                )}
              </div>
              {slotItems.length > 0 ? (
                <ul className="mt-1 space-y-0.5 text-sm text-neutral-400">
                  {slotItems.map((it) => (
                    <li key={it.id} className="flex justify-between gap-2">
                      <span>{itemLabel(it)}</span>
                      {it.optionGroup && (
                        <span className="shrink-0 text-xs text-neutral-600">
                          {it.optionGroup}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                tmpl?.notes && (
                  <p className="mt-1 text-sm text-neutral-400">{tmpl.notes}</p>
                )
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function MealPlan({
  targets,
  templates,
  items,
}: {
  targets: DailyTarget[];
  templates: MealTemplate[];
  items: MealItem[];
}) {
  const hasAny = targets.length > 0 || templates.length > 0 || items.length > 0;
  return (
    <section className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
      <h2 className="mb-3 text-sm font-medium text-neutral-300">Meal plan</h2>
      {!hasAny ? (
        <p className="text-sm text-neutral-500">No meal plan defined yet.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {DAY_TYPES.map((dt) => (
            <DayColumn
              key={dt}
              dayType={dt}
              target={targets.find((t) => t.dayType === dt) ?? null}
              templates={templates.filter((t) => t.dayType === dt)}
              items={items.filter((i) => i.dayType === dt)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
