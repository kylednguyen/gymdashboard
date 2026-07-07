"use client";
import { useState } from "react";
import { CheckIn, DailyTarget } from "@/lib/types";
import {
  checkInForDate,
  currentCheckIn,
  consumedMacros,
  targetMacrosFor,
  targetFor,
} from "@/lib/metrics";
import { Ring } from "./Ring";
import { LogEntry } from "./LogEntry";
import { Accordion } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
        <div className="tnum text-[11px] text-muted-foreground">
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

function fmtChip(iso: string): { weekday: string; day: string } {
  const d = new Date(iso + "T00:00:00Z");
  return {
    weekday: d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
    day: d.toLocaleDateString("en-US", { month: "numeric", day: "numeric", timeZone: "UTC" }),
  };
}

/** Horizontal strip of logged days; tapping one features it above. */
function DayStrip({
  dates,
  selected,
  today,
  onSelect,
}: {
  dates: string[];
  selected: string | null;
  today: string;
  onSelect: (d: string) => void;
}) {
  if (dates.length < 2) return null;
  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <div className="flex w-max gap-2">
        {dates.map((d) => {
          const active = d === selected;
          const { weekday, day } = fmtChip(d);
          return (
            <button
              key={d}
              type="button"
              onClick={() => onSelect(d)}
              aria-pressed={active}
              className={`flex min-w-[64px] cursor-pointer flex-col items-center rounded-2xl px-3 py-2 transition-all duration-200 active:scale-95 ${
                active ? "bg-primary text-white shadow-sm" : "bg-card text-muted-foreground"
              }`}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wide">
                {d === today ? "Today" : weekday}
              </span>
              <span
                className={`tnum text-sm font-bold ${active ? "text-white" : "text-foreground"}`}
              >
                {day}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function LogTab({ checkIns, targets, today }: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Default to today's check-in (or the latest); tapping a day chip overrides.
  const current = selectedDate
    ? checkInForDate(checkIns, selectedDate)
    : currentCheckIn(checkIns, today);
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
          <h2 className="text-base font-bold">
            {isToday ? "Today" : selectedDate ? fmtLong(selectedDate) : "Latest"}
          </h2>
          <p className="text-xs text-muted-foreground">{current ? fmtLong(current.date) : today}</p>
        </div>
        <Badge variant={dayType ? "brand" : "secondary"} className="px-3 py-1">
          {dayType ?? (current ? "Day type not set" : "No check-ins")}
        </Badge>
      </div>

      <DayStrip
        dates={logged.map((c) => c.date)}
        selected={current?.date ?? null}
        today={today}
        onSelect={(d) => setSelectedDate(d)}
      />

      {/* Calories consumed */}
      <Card key={current?.id ?? "none"} className="animate-fade gap-2">
        <CardHeader>
          <CardTitle>Calories consumed</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Ring pct={cal ? consumed.calories / cal : 0} size={200} stroke={16} color="var(--primary)">
            <span className="tnum font-condensed text-5xl font-bold leading-none">
              {consumed.calories}
            </span>
            <span className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Consumed
            </span>
          </Ring>
          <div className="mt-4 flex w-full justify-center gap-8 text-center">
            <div>
              <div className="tnum text-base font-bold">{cal ?? "—"}</div>
              <div className="text-xs text-muted-foreground">Target</div>
            </div>
            <div>
              <div className="tnum text-base font-bold">{remaining ?? "—"}</div>
              <div className="text-xs text-muted-foreground">Remaining</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Macros */}
      <Card className="gap-4">
        <CardHeader>
          <CardTitle>Macros</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-around">
          <MacroRing label="Carbs" consumed={consumed.carbsG} target={target?.carbsG ?? null} color="var(--carbs)" />
          <MacroRing label="Protein" consumed={consumed.proteinG} target={target?.proteinG ?? null} color="var(--protein)" />
          <MacroRing label="Fat" consumed={consumed.fatG} target={target?.fatG ?? null} color="var(--fat)" />
        </CardContent>
      </Card>

      {/* What I ate (featured day) */}
      {current?.notes && (
        <Card className="gap-2">
          <CardHeader>
            <CardTitle>What I ate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-sm text-foreground">{current.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Recent calorie log — tap a day to see what you ate */}
      <Card className="gap-1">
        <CardHeader>
          <CardTitle>Recent log</CardTitle>
        </CardHeader>
        <CardContent>
          {logged.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              No days logged yet — add a Check-In in Airtable.
            </p>
          ) : (
            <Accordion type="multiple">
              {logged.map((c) => (
                <LogEntry
                  key={c.id}
                  c={c}
                  targetCalories={c.dayType ? targetFor(targets, c.dayType)?.calories ?? null : null}
                />
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
