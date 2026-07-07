"use client";
import { useState } from "react";
import { CheckIn, UNIT_WEIGHT, WorkoutSet } from "@/lib/types";
import {
  checkInForDate,
  diaryDates,
  exercisesForDate,
  exerciseProgress,
  exerciseSummaries,
} from "@/lib/metrics";
import { ChevronIcon } from "./icons";
import { LiftProgressChart } from "./LiftProgressChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function fmtDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="-ml-3 mb-1 gap-1 font-semibold text-primary hover:text-primary active:scale-95"
    >
      <ChevronIcon className="h-5 w-5 rotate-90" />
      {label}
    </Button>
  );
}

function WorkoutBadge({ workout }: { workout: boolean }) {
  return (
    <Badge variant={workout ? "brand" : "secondary"}>{workout ? "Workout" : "Rest day"}</Badge>
  );
}

export function GymDiaryTab({
  checkIns,
  workoutSets,
}: {
  checkIns: CheckIn[];
  workoutSets: WorkoutSet[];
}) {
  const [date, setDate] = useState<string | null>(null);
  const [exercise, setExercise] = useState<string | null>(null);

  // --- Level 3: exercise progress (reached from a day or from the lift browser) ---
  if (exercise) {
    const series = exerciseProgress(workoutSets, exercise);
    const history = series.slice().reverse();
    const pr = series.length ? Math.max(...series.map((p) => p.weight)) : null;
    return (
      <div key={`ex-${exercise}`} className="animate-in flex flex-col gap-4">
        <div>
          <BackButton
            label={date ? fmtDate(date) : "Gym diary"}
            onClick={() => setExercise(null)}
          />
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">{exercise}</h2>
            {pr !== null && (
              <Badge variant="brand" className="tnum">
                PR {pr} {UNIT_WEIGHT}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Top set over time</p>
        </div>
        <Card>
          <CardContent>
            <LiftProgressChart data={series} />
          </CardContent>
        </Card>
        {history.length > 0 && (
          <Card className="gap-2">
            <CardHeader>
              <CardTitle>History</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col">
              {history.map((p) => (
                <li
                  key={p.date}
                  className="flex items-center justify-between border-t border-border py-2 text-sm first:border-t-0"
                >
                  <span>{fmtDate(p.date)}</span>
                  <span className="flex items-center gap-2">
                    {p.weight === pr && (
                      <Badge variant="brand" className="px-2 text-[10px] font-bold uppercase tracking-wide">
                        PR
                      </Badge>
                    )}
                    <span className="tnum font-semibold">
                      {p.weight} {UNIT_WEIGHT}
                    </span>
                  </span>
                </li>
              ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // --- Level 2: day detail ---
  if (date) {
    const c = checkInForDate(checkIns, date);
    const groups = exercisesForDate(workoutSets, date);
    const prByExercise = new Map(
      exerciseSummaries(workoutSets).map((l) => [l.exercise, l.topWeight])
    );
    return (
      <div key={`day-${date}`} className="animate-in flex flex-col gap-4">
        <div>
          <BackButton label="Gym diary" onClick={() => setDate(null)} />
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">{fmtDate(date)}</h2>
            {/* A day with logged sets is a workout day even if the check-in box is unticked. */}
            <WorkoutBadge workout={(c?.workout ?? false) || groups.length > 0} />
          </div>
        </div>

        <Card className="gap-0 py-4">
          <CardContent className="px-4">
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
              {c?.dayType && <span>{c.dayType}</span>}
              {c?.bodyweightLb !== undefined && (
                <span className="tnum">
                  {c.bodyweightLb} {UNIT_WEIGHT}
                </span>
              )}
              {c?.steps !== undefined && (
                <span className="tnum">{c.steps.toLocaleString()} steps</span>
              )}
              {!c && <span>No check-in for this day</span>}
            </div>
            {c?.notes && <p className="mt-2 text-sm text-foreground">{c.notes}</p>}
          </CardContent>
        </Card>

        <div>
          <h3 className="mb-2 px-1 text-sm font-semibold text-muted-foreground">Exercises</h3>
          {groups.length === 0 ? (
            <p className="rounded-2xl bg-card p-4 text-sm text-muted-foreground">
              No exercises logged — add rows to the Workout Log table in Airtable.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {groups.map((g, i) => (
                <button
                  key={g.exercise}
                  type="button"
                  onClick={() => setExercise(g.exercise)}
                  style={{ animationDelay: `${i * 50}ms` }}
                  className="animate-in cursor-pointer rounded-2xl bg-card p-4 text-left transition-transform active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-semibold">
                      {g.exercise}
                      {g.topWeight !== null && g.topWeight === prByExercise.get(g.exercise) && (
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                          PR
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      {g.topWeight !== null && (
                        <span className="tnum font-semibold text-foreground">
                          {g.topWeight} {UNIT_WEIGHT}
                        </span>
                      )}
                      <ChevronIcon className="h-5 w-5 -rotate-90" />
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {g.sets
                      .map(
                        (s) =>
                          `${s.reps ?? "—"}×${s.weightLb ?? "—"}`
                      )
                      .join("  ·  ")}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Level 1: list of days ---
  const dates = diaryDates(checkIns, workoutSets);
  const lifts = exerciseSummaries(workoutSets);
  return (
    <div key="list" className="animate-in flex flex-col gap-4">
      <div>
        <h2 className="text-base font-bold">Gym diary</h2>
        <p className="text-xs text-muted-foreground">Tap a day to see your workout</p>
      </div>

      {lifts.length > 0 && (
        <div>
          <h3 className="mb-2 px-1 text-sm font-semibold text-muted-foreground">Your lifts</h3>
          <div className="-mx-4 overflow-x-auto px-4">
            <div className="flex w-max gap-2">
              {lifts.map((l) => (
                <button
                  key={l.exercise}
                  type="button"
                  onClick={() => setExercise(l.exercise)}
                  className="cursor-pointer rounded-2xl bg-card px-3.5 py-2.5 text-left transition-transform active:scale-95"
                >
                  <div className="text-sm font-semibold">{l.exercise}</div>
                  <div className="tnum text-xs text-muted-foreground">
                    {l.topWeight !== null ? `PR ${l.topWeight} ${UNIT_WEIGHT}` : "No weight logged"}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {dates.length === 0 ? (
        <p className="rounded-2xl bg-card p-4 text-sm text-muted-foreground">
          No entries yet — add a Check-In or Workout Log row in Airtable.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {dates.map((d, i) => {
            const c = checkInForDate(checkIns, d);
            const count = exercisesForDate(workoutSets, d).length;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDate(d)}
                style={{ animationDelay: `${i * 50}ms` }}
                className="animate-in cursor-pointer rounded-2xl bg-card p-4 text-left transition-transform active:scale-[0.99]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{fmtDate(d)}</span>
                  <div className="flex items-center gap-2">
                    <WorkoutBadge workout={(c?.workout ?? false) || count > 0} />
                    <ChevronIcon className="h-5 w-5 -rotate-90 text-muted-foreground" />
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {c?.dayType && <span>{c.dayType}</span>}
                  {c?.bodyweightLb !== undefined && (
                    <span className="tnum">
                      {c.bodyweightLb} {UNIT_WEIGHT}
                    </span>
                  )}
                  {count > 0 && (
                    <span>
                      {count} exercise{count === 1 ? "" : "s"}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
