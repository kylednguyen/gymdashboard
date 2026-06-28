import { UNIT_WEIGHT } from "@/lib/types";

interface Props {
  workoutsThisWeek: number;
  currentStreak: number;
  latestWeight: number | null;
  goalsOnTrack: number;
  goalsTotal: number;
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/5 p-4 shadow ring-1 ring-white/10">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-sm text-neutral-400">{label}</div>
    </div>
  );
}

export function KpiCards(p: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <Card label="Workouts this week" value={String(p.workoutsThisWeek)} />
      <Card label="Current streak" value={`${p.currentStreak} d`} />
      <Card label="Latest weight" value={p.latestWeight === null ? "—" : `${p.latestWeight} ${UNIT_WEIGHT}`} />
      <Card label="Goals on track" value={`${p.goalsOnTrack}/${p.goalsTotal}`} />
    </div>
  );
}
