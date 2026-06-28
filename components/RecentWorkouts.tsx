import { Workout } from "@/lib/types";

export function RecentWorkouts({ workouts }: { workouts: Workout[] }) {
  return (
    <section className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
      <h2 className="mb-3 text-sm font-medium text-neutral-300">Recent workouts</h2>
      {workouts.length === 0 ? (
        <p className="text-sm text-neutral-500">No workouts logged yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-left text-neutral-400">
            <tr>
              <th className="py-1">Date</th>
              <th className="py-1">Type</th>
              <th className="py-1">Min</th>
            </tr>
          </thead>
          <tbody>
            {workouts.map((w) => (
              <tr key={w.id} className="border-t border-white/5">
                <td className="py-1">{w.date}</td>
                <td className="py-1">{w.type}</td>
                <td className="py-1">{w.durationMin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
