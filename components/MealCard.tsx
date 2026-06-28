"use client";
import { useState } from "react";
import { MealItem } from "@/lib/types";
import { ChevronIcon } from "./icons";

function itemLabel(it: MealItem): string {
  const amount = it.amountG !== undefined ? `${it.amountG} g ` : "";
  const state = it.state && it.state !== "not specified" ? ` (${it.state})` : "";
  return `${amount}${it.food}${state}`;
}

export function MealCard({
  slot,
  timing,
  items,
  defaultOpen = false,
}: {
  slot: string;
  timing?: string;
  items: MealItem[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-2xl bg-surface">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-2 px-4 py-3.5 text-left transition-transform active:scale-[0.99]"
      >
        <div>
          <div className="font-semibold">{slot}</div>
          {timing && <div className="text-xs text-muted">{timing}</div>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">
            {items.length} item{items.length === 1 ? "" : "s"}
          </span>
          <ChevronIcon
            className={`h-5 w-5 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <ul className="space-y-1.5 border-t border-border px-4 py-3 text-sm">
            {items.length === 0 ? (
              <li className="text-muted">No items.</li>
            ) : (
              items.map((it) => (
                <li key={it.id} className="flex justify-between gap-3">
                  <span className="text-foreground">{itemLabel(it)}</span>
                  {it.optionGroup && (
                    <span className="shrink-0 text-xs text-muted">{it.optionGroup}</span>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
