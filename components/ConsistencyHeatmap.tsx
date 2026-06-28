export function ConsistencyHeatmap({ data }: { data: { date: string; count: number }[] }) {
  const shade = (count: number) =>
    count === 0 ? "bg-white/5" : count === 1 ? "bg-sky-700" : count === 2 ? "bg-sky-500" : "bg-sky-300";
  return (
    <section className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
      <h2 className="mb-3 text-sm font-medium text-neutral-300">Consistency (last {data.length} days)</h2>
      <div className="flex flex-wrap gap-1">
        {data.map((d) => (
          <div key={d.date} title={`${d.date}: ${d.count}`} role="img" aria-label={`${d.date}: ${d.count} workouts`} className={`h-4 w-4 rounded-sm ${shade(d.count)}`} />
        ))}
      </div>
    </section>
  );
}
