"use client";
import { useState } from "react";
import { CheckIn, UNIT_WEIGHT } from "@/lib/types";
import { ChevronIcon } from "./icons";

function fmtShort(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${m}/${d}`;
}

/** A tappable recent-log row that expands to show what was eaten + details. */
export function LogEntry({
  c,
  targetCalories,
}: {
  c: CheckIn;
  targetCalories: number | null;
}) {
  const [open, setOpen] = useState(false);
  const macros = [
    c.proteinG !== undefined ? `${c.proteinG}g protein` : null,
    c.carbsG !== undefined ? `${c.carbsG}g carbs` : null,
    c.fatG !== undefined ? `${c.fatG}g fat` : null,
  ].filter(Boolean) as string[];

  return (
    <div className="border-t border-border first:border-t-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-2 py-2.5 text-left transition-transform active:scale-[0.99]"
      >
        <div className="flex items-center gap-2">
          <ChevronIcon
            className={`h-4 w-4 text-muted transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"}`}
          />
          <div>
            <div className="text-sm font-semibold">{fmtShort(c.date)}</div>
            {c.dayType && <div className="text-xs text-muted">{c.dayType}</div>}
          </div>
        </div>
        <div className="tnum text-sm">
          <span className="font-bold">{c.caloriesLogged}</span>
          <span className="text-muted"> / {targetCalories ?? "—"}</span>
        </div>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="pb-3 pl-6 pr-1 text-sm">
            {c.notes ? (
              <p className="whitespace-pre-line text-foreground">{c.notes}</p>
            ) : (
              <p className="text-muted">No notes for this day.</p>
            )}
            {macros.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {macros.map((m) => (
                  <span
                    key={m}
                    className="tnum rounded-full bg-white/5 px-2 py-0.5 text-xs text-muted"
                  >
                    {m}
                  </span>
                ))}
              </div>
            )}
            {(c.bodyweightLb !== undefined || c.steps !== undefined) && (
              <div className="mt-2 flex gap-4 text-xs text-muted">
                {c.bodyweightLb !== undefined && (
                  <span className="tnum">
                    {c.bodyweightLb} {UNIT_WEIGHT}
                  </span>
                )}
                {c.steps !== undefined && (
                  <span className="tnum">{c.steps.toLocaleString()} steps</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
