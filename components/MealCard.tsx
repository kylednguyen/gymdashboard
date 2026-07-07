"use client";
import { MealItem } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

function itemLabel(it: MealItem): string {
  const amount = it.amountG !== undefined ? `${it.amountG} g ` : "";
  const state = it.state && it.state !== "not specified" ? ` (${it.state})` : "";
  return `${amount}${it.food}${state}`;
}

export function MealCard({
  slot,
  timing,
  items,
  notes,
  defaultOpen = false,
}: {
  slot: string;
  timing?: string;
  items: MealItem[];
  notes?: string;
  defaultOpen?: boolean;
}) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpen ? slot : undefined}
      className="overflow-hidden rounded-2xl bg-card"
    >
      <AccordionItem value={slot} className="border-b-0">
        <AccordionTrigger className="px-4">
          <span className="flex w-full items-center justify-between gap-2">
            <span>
              <span className="block font-semibold">{slot}</span>
              {timing && (
                <span className="block text-xs font-normal text-muted-foreground">{timing}</span>
              )}
            </span>
            <span className="shrink-0 text-xs font-normal text-muted-foreground">
              {items.length} item{items.length === 1 ? "" : "s"}
            </span>
          </span>
        </AccordionTrigger>
        <AccordionContent className="pb-0">
          <div className="border-t border-border px-4 py-3">
            {notes && <p className="mb-2 text-sm text-muted-foreground">{notes}</p>}
            <ul className="space-y-1.5 text-sm">
              {items.length === 0 ? (
                <li className="text-muted-foreground">No items.</li>
              ) : (
                items.map((it) => (
                  <li key={it.id} className="flex items-center justify-between gap-3">
                    <span className="text-foreground">{itemLabel(it)}</span>
                    {it.optionGroup && <Badge variant="secondary">{it.optionGroup}</Badge>}
                  </li>
                ))
              )}
            </ul>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
