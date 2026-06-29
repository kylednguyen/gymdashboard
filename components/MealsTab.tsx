import { CheckIn, DailyTarget } from "@/lib/types";
import { targetFor } from "@/lib/metrics";

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
}

export function MealsTab({ checkIns, targets }: Props) {
  const days = checkIns
    .filter((c) => c.date && (c.caloriesLogged !== undefined || c.notes))
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-bold">My meals</h2>
        <p className="text-xs text-muted">What you&apos;ve eaten, by day</p>
      </div>

      {days.length === 0 ? (
        <p className="rounded-2xl bg-surface p-4 text-sm text-muted">
          No meals logged yet — add a Check-In with notes in Airtable.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {days.map((c, i) => {
            const target = c.dayType ? targetFor(targets, c.dayType)?.calories ?? null : null;
            const macros = [
              c.proteinG !== undefined ? `${c.proteinG}g protein` : null,
              c.carbsG !== undefined ? `${c.carbsG}g carbs` : null,
              c.fatG !== undefined ? `${c.fatG}g fat` : null,
            ].filter(Boolean) as string[];
            return (
              <section
                key={c.id}
                className="animate-in rounded-2xl bg-surface p-4"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold">{fmtLong(c.date)}</div>
                    {c.dayType && <div className="text-xs text-muted">{c.dayType}</div>}
                  </div>
                  {c.caloriesLogged !== undefined && (
                    <div className="tnum shrink-0 text-sm">
                      <span className="font-bold">{c.caloriesLogged}</span>
                      <span className="text-muted"> / {target ?? "—"} kcal</span>
                    </div>
                  )}
                </div>
                {c.notes ? (
                  <p className="mt-2 whitespace-pre-line text-sm text-foreground">{c.notes}</p>
                ) : (
                  <p className="mt-2 text-sm text-muted">No meal details logged.</p>
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
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
