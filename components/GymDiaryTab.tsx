import { CheckIn, UNIT_WEIGHT } from "@/lib/types";

function fmtDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function Entry({ c, delay }: { c: CheckIn; delay: number }) {
  return (
    <article
      className="animate-in rounded-2xl bg-surface p-4"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="font-semibold">{fmtDate(c.date)}</div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            c.workout ? "bg-brand/15 text-brand" : "bg-white/5 text-muted"
          }`}
        >
          {c.workout ? "Workout" : "Rest day"}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
        {c.dayType && <span>{c.dayType}</span>}
        {c.bodyweightLb !== undefined && (
          <span className="tnum">
            {c.bodyweightLb} {UNIT_WEIGHT}
          </span>
        )}
        {c.steps !== undefined && <span className="tnum">{c.steps.toLocaleString()} steps</span>}
      </div>
      {c.notes && <p className="mt-2 text-sm text-foreground">{c.notes}</p>}
    </article>
  );
}

export function GymDiaryTab({ checkIns }: { checkIns: CheckIn[] }) {
  const entries = checkIns
    .filter((c) => c.date)
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-bold">Gym diary</h2>
        <p className="text-xs text-muted">Your training journal</p>
      </div>

      {entries.length === 0 ? (
        <p className="rounded-2xl bg-surface p-4 text-sm text-muted">
          No entries yet — add a Check-In in Airtable to start your diary.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((c, i) => (
            <Entry key={c.id} c={c} delay={i * 50} />
          ))}
        </div>
      )}
    </div>
  );
}
