"use client";
import { useState } from "react";
import { CheckIn, DailyTarget, DayType, MealItem, MealTemplate } from "@/lib/types";
import { dayTypeForDate, mealPlanFor, targetFor } from "@/lib/metrics";
import { DayTypeToggle } from "./DayTypeToggle";
import { MealCard } from "./MealCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

function fmtLong(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

interface Props {
  checkIns: CheckIn[];
  targets: DailyTarget[];
  mealTemplates: MealTemplate[];
  mealItems: MealItem[];
  today: string;
}

type View = "plan" | "history";

function TargetChips({ target }: { target: DailyTarget | null }) {
  if (!target) return null;
  const chips = [
    { label: "kcal", value: target.calories, color: "var(--primary)" },
    { label: "protein", value: `${target.proteinG}g`, color: "var(--protein)" },
    { label: "carbs", value: `${target.carbsG}g`, color: "var(--carbs)" },
    { label: "fat", value: `${target.fatG}g`, color: "var(--fat)" },
  ];
  return (
    <div className="grid grid-cols-4 gap-2">
      {chips.map((c) => (
        <div key={c.label} className="rounded-xl bg-card px-2 py-2 text-center">
          <div className="tnum text-sm font-bold" style={{ color: c.color }}>
            {c.value}
          </div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{c.label}</div>
        </div>
      ))}
    </div>
  );
}

function PlanView({
  targets,
  mealTemplates,
  mealItems,
  initialDayType,
}: {
  targets: DailyTarget[];
  mealTemplates: MealTemplate[];
  mealItems: MealItem[];
  initialDayType: DayType;
}) {
  const [dayType, setDayType] = useState<DayType>(initialDayType);
  const plan = mealPlanFor(mealTemplates, mealItems, dayType);
  return (
    <div key={dayType} className="animate-in flex flex-col gap-3">
      <DayTypeToggle value={dayType} onChange={setDayType} />
      <TargetChips target={targetFor(targets, dayType)} />
      {plan.length === 0 ? (
        <p className="rounded-2xl bg-card p-4 text-sm text-muted-foreground">
          No meal templates for this day type — add rows to Meal Templates in Airtable.
        </p>
      ) : (
        plan.map(({ template, items }, i) => (
          <div key={template.id} className="animate-in" style={{ animationDelay: `${i * 50}ms` }}>
            <MealCard
              slot={template.mealSlot ?? template.name}
              timing={template.timing}
              items={items}
              notes={template.notes}
              defaultOpen={i === 0}
            />
          </div>
        ))
      )}
    </div>
  );
}

function HistoryView({ checkIns, targets }: { checkIns: CheckIn[]; targets: DailyTarget[] }) {
  const days = checkIns
    .filter((c) => c.date && (c.caloriesLogged !== undefined || c.notes))
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  if (days.length === 0) {
    return (
      <p className="rounded-2xl bg-card p-4 text-sm text-muted-foreground">
        No meals logged yet — add a Check-In with notes in Airtable.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {days.map((c, i) => {
        const target = c.dayType ? targetFor(targets, c.dayType)?.calories ?? null : null;
        const macros = [
          c.proteinG !== undefined ? `${c.proteinG}g protein` : null,
          c.carbsG !== undefined ? `${c.carbsG}g carbs` : null,
          c.fatG !== undefined ? `${c.fatG}g fat` : null,
        ].filter(Boolean) as string[];
        return (
          <Card
            key={c.id}
            className="animate-in gap-0 py-4"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <CardContent className="px-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{fmtLong(c.date)}</div>
                  {c.dayType && <div className="text-xs text-muted-foreground">{c.dayType}</div>}
                </div>
                {c.caloriesLogged !== undefined && (
                  <div className="tnum shrink-0 text-sm">
                    <span className="font-bold">{c.caloriesLogged}</span>
                    <span className="text-muted-foreground"> / {target ?? "—"} kcal</span>
                  </div>
                )}
              </div>
              {c.notes ? (
                <p className="mt-2 whitespace-pre-line text-sm text-foreground">{c.notes}</p>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">No meal details logged.</p>
              )}
              {macros.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {macros.map((m) => (
                    <Badge key={m} variant="secondary" className="tnum">
                      {m}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function MealsTab({ checkIns, targets, mealTemplates, mealItems, today }: Props) {
  const [view, setView] = useState<View>("plan");
  // Pre-select the plan for today's logged day type, falling back to Training.
  const initialDayType = dayTypeForDate(checkIns, today) ?? "Training Day";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold">My meals</h2>
          <p className="text-xs text-muted-foreground">
            {view === "plan" ? "Your meal plan, by day type" : "What you've eaten, by day"}
          </p>
        </div>
        <Tabs value={view} onValueChange={(v) => setView(v as View)} aria-label="Meals view">
          <TabsList>
            <TabsTrigger value="plan">Plan</TabsTrigger>
            <TabsTrigger value="history">Eaten</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div key={view} className="animate-in">
        {view === "plan" ? (
          <PlanView
            targets={targets}
            mealTemplates={mealTemplates}
            mealItems={mealItems}
            initialDayType={initialDayType}
          />
        ) : (
          <HistoryView checkIns={checkIns} targets={targets} />
        )}
      </div>
    </div>
  );
}
