"use client";
import { useState } from "react";
import { CheckIn, DailyTarget, DayType, MealItem, MealTemplate, WorkoutSet } from "@/lib/types";
import { dayTypeForDate } from "@/lib/metrics";
import { LogTab } from "./LogTab";
import { MealsTab } from "./MealsTab";
import { GymDiaryTab } from "./GymDiaryTab";
import { ProgressTab } from "./ProgressTab";
import { ClipboardIcon, UtensilsIcon, DumbbellIcon, TrendingIcon } from "./icons";

interface DashboardData {
  checkIns: CheckIn[];
  targets: DailyTarget[];
  mealTemplates: MealTemplate[];
  mealItems: MealItem[];
  workoutSets: WorkoutSet[];
}

type Tab = "log" | "meals" | "diary" | "progress";

const TABS: { id: Tab; label: string; Icon: typeof ClipboardIcon; subtitle: string }[] = [
  { id: "log", label: "Log", Icon: ClipboardIcon, subtitle: "Today's calorie log" },
  { id: "meals", label: "Meals", Icon: UtensilsIcon, subtitle: "Your typical meals" },
  { id: "diary", label: "Gym Diary", Icon: DumbbellIcon, subtitle: "Training journal" },
  { id: "progress", label: "Progress", Icon: TrendingIcon, subtitle: "Bodyweight trend" },
];

export function AppShell({ data, today }: { data: DashboardData; today: string }) {
  const [tab, setTab] = useState<Tab>("log");
  // Proactively pre-select the day type logged for today, if any.
  const [dayType, setDayType] = useState<DayType>(
    () => dayTypeForDate(data.checkIns, today) ?? "Training Day"
  );
  const active = TABS.find((t) => t.id === tab)!;

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-surface/85 px-4 py-3 backdrop-blur">
        <h1 className="text-lg font-bold tracking-tight">Gym Dashboard</h1>
        <p className="text-xs text-muted">{active.subtitle}</p>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-28 pt-4">
        <div key={tab} className="animate-in">
          {tab === "log" && (
            <LogTab checkIns={data.checkIns} targets={data.targets} today={today} />
          )}
          {tab === "meals" && (
            <MealsTab
              templates={data.mealTemplates}
              items={data.mealItems}
              targets={data.targets}
              dayType={dayType}
              onDayType={setDayType}
            />
          )}
          {tab === "diary" && (
            <GymDiaryTab checkIns={data.checkIns} workoutSets={data.workoutSets} />
          )}
          {tab === "progress" && <ProgressTab checkIns={data.checkIns} today={today} />}
        </div>
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-md border-t border-border bg-surface"
        aria-label="Primary"
      >
        {TABS.map(({ id, label, Icon }) => {
          const selected = id === tab;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-current={selected ? "page" : undefined}
              className={`flex min-h-[60px] flex-1 cursor-pointer flex-col items-center justify-center gap-1 pt-1 pb-[calc(0.25rem+env(safe-area-inset-bottom))] text-[11px] font-semibold transition-colors active:scale-95 ${
                selected ? "text-brand" : "text-muted"
              }`}
            >
              <Icon className="h-6 w-6" />
              {label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
