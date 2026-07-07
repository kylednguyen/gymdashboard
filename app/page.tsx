import { getDashboardData } from "@/lib/airtable";
import { AppShell } from "@/components/AppShell";

export const revalidate = 60;

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function Page() {
  let data: Awaited<ReturnType<typeof getDashboardData>>;
  try {
    data = await getDashboardData();
  } catch (e) {
    // Log the real cause server-side only; never surface backend details
    // (base id, table names, Airtable auth errors) to the browser.
    console.error("Dashboard data fetch failed:", e);
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-2 p-6 text-center">
        <h1 className="text-lg font-bold">Gym Dashboard</h1>
        <p className="rounded-2xl bg-card p-4 text-sm text-muted-foreground">
          Could not load data right now. Please try again later.
        </p>
      </main>
    );
  }

  return <AppShell data={data} today={todayISO()} />;
}
