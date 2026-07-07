"use client";
import { CheckIn, UNIT_WEIGHT } from "@/lib/types";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

function fmtShort(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${m}/${d}`;
}

/**
 * A tappable recent-log row that expands to show what was eaten + details.
 * Must be rendered inside an <Accordion type="multiple"> list.
 */
export function LogEntry({
  c,
  targetCalories,
}: {
  c: CheckIn;
  targetCalories: number | null;
}) {
  const macros = [
    c.proteinG !== undefined ? `${c.proteinG}g protein` : null,
    c.carbsG !== undefined ? `${c.carbsG}g carbs` : null,
    c.fatG !== undefined ? `${c.fatG}g fat` : null,
  ].filter(Boolean) as string[];

  return (
    <AccordionItem value={c.id}>
      <AccordionTrigger className="py-2.5">
        <span className="flex w-full items-center justify-between gap-2">
          <span>
            <span className="block text-sm font-semibold">{fmtShort(c.date)}</span>
            {c.dayType && (
              <span className="block text-xs font-normal text-muted-foreground">{c.dayType}</span>
            )}
          </span>
          <span className="tnum text-sm font-normal">
            <span className="font-bold">{c.caloriesLogged}</span>
            <span className="text-muted-foreground"> / {targetCalories ?? "—"}</span>
          </span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="pb-3">
        {c.notes ? (
          <p className="whitespace-pre-line text-foreground">{c.notes}</p>
        ) : (
          <p className="text-muted-foreground">No notes for this day.</p>
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
        {(c.bodyweightLb !== undefined || c.steps !== undefined) && (
          <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
            {c.bodyweightLb !== undefined && (
              <span className="tnum">
                {c.bodyweightLb} {UNIT_WEIGHT}
              </span>
            )}
            {c.steps !== undefined && <span className="tnum">{c.steps.toLocaleString()} steps</span>}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
