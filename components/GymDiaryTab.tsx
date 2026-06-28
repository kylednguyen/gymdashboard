"use client";
import { useState } from "react";
import { CheckIn, UNIT_WEIGHT, WorkoutSet } from "@/lib/types";
import {
  checkInForDate,
  diaryDates,
  exercisesForDate,
  exerciseProgress,
} from "@/lib/metrics";
import { ChevronIcon } from "./icons";
import { LiftProgressChart } from "./LiftProgressChart";

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
    <button
      type="button"
      onClick={onClick}
      className="-ml-1 mb-1 flex cursor-pointer items-center gap-1 text-sm font-semibold text-brand active:scale-95"
    >
      <ChevronIcon className="h-5 w-5 rotate-90" />
      {label}
    </button>
  );
}

function Badge({ workout }: { workout: boolean }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        workout ? "bg-brand/15 text-brand" : "bg-white/5 text-muted"
      }`}
    >
      {workout ? "Workout" : "Rest day"}
    </span>
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

  // --- Level 3: exercise progress ---
  if (date && exercise) {
    const series = exerciseProgress(workoutSets, exercise);
    const history = series.slice().reverse();
    return (
      <div key={`ex-${exercise}`} className="animate-in flex flex-col gap-4">
        <div>
          <BackButton label={fmtDate(date)} onClick={() => setExercise(null)} />
          <h2 className="text-base font-bold">{exercise}</h2>
          <p className="text-xs text-muted">Top set over time</p>
        </div>
        <section className="rounded-2xl bg-surface p-5">
          <LiftProgressChart data={series} />
        </section>
        {history.length > 0 && (
          <section className="rounded-2xl bg-surface p-5">
            <h3 className="mb-2 text-sm font-semibold text-muted">History</h3>
            <ul className="flex flex-col">
              {history.map((p) => (
                <li
                  key={p.date}
                  className="flex items-center justify-between border-t border-border py-2 text-sm first:border-t-0"
                >
                  <span>{fmtDate(p.date)}</span>
                  <span className="tnum font-semibold">
                    {p.weight} {UNIT_WEIGHT}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    );
  }

  // --- Level 2: day detail ---
  if (date) {
    const c = checkInForDate(checkIns, date);
    const groups = exercisesForDate(workoutSets, date);
    return (
      <div key={`day-${date}`} className="animate-in flex flex-col gap-4">
        <div>
          <BackButton label="Gym diary" onClick={() => setDate(null)} />
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">{fmtDate(date)}</h2>
            <Badge workout={c?.workout ?? groups.length > 0} />
          </div>
        </div>

        <section className="rounded-2xl bg-surface p-4">
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
            {c?.dayType && <span>{c.dayType}</span>}
            {c?.bodyweightLb !== undefined && (
              <span className="tnum">
                {c.bodyweightLb} {UNIT_WEIGHT}
              </span>
            )}
            {c?.steps !== undefined && <span className="tnum">{c.steps.toLocaleString()} steps</span>}
            {!c && <span>No check-in for this day</span>}
          </div>
          {c?.notes && <p className="mt-2 text-sm text-foreground">{c.notes}</p>}
        </section>

        <div>
          <h3 className="mb-2 px-1 text-sm font-semibold text-muted">Exercises</h3>
          {groups.length === 0 ? (
            <p className="rounded-2xl bg-surface p-4 text-sm text-muted">
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
                  className="animate-in cursor-pointer rounded-2xl bg-surface p-4 text-left transition-transform active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{g.exercise}</span>
                    <span className="flex items-center gap-1 text-sm text-muted">
                      {g.topWeight !== null && (
                        <span className="tnum font-semibold text-foreground">
                          {g.topWeight} {UNIT_WEIGHT}
                        </span>
                      )}
                      <ChevronIcon className="h-5 w-5 -rotate-90" />
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted">
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
  return (
    <div key="list" className="animate-in flex flex-col gap-4">
      <div>
        <h2 className="text-base font-bold">Gym diary</h2>
        <p className="text-xs text-muted">Tap a day to see your workout</p>
      </div>

      {dates.length === 0 ? (
        <p className="rounded-2xl bg-surface p-4 text-sm text-muted">
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
                className="animate-in cursor-pointer rounded-2xl bg-surface p-4 text-left transition-transform active:scale-[0.99]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{fmtDate(d)}</span>
                  <div className="flex items-center gap-2">
                    <Badge workout={c?.workout ?? count > 0} />
                    <ChevronIcon className="h-5 w-5 -rotate-90 text-muted" />
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
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
