# Personal Fitness Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A private, mobile-friendly Next.js dashboard that visualizes the owner's fitness data read live from Airtable, deployed to Vercel behind a password gate.

**Architecture:** Next.js App Router with React Server Components fetch from Airtable server-side (token never reaches the browser). Pure functions derive metrics from raw records. A middleware enforces HTTP Basic Auth. Tailwind gives a mobile-first responsive layout; Recharts renders charts.

**Tech Stack:** Next.js (App Router) + TypeScript + Tailwind CSS + Recharts + `airtable` SDK + Vitest (unit tests).

## Global Constraints

- Node: use the version `create-next-app` defaults to (Node 18.18+).
- TypeScript everywhere; `strict` mode on (Next.js default).
- The Airtable token (`AIRTABLE_PAT`) is read ONLY in server-side code. Never import the data layer into a Client Component.
- Env vars: `AIRTABLE_PAT`, `AIRTABLE_BASE_ID`, `DASHBOARD_PASSWORD`. All three live in `.env.local` (gitignored) and Vercel project settings.
- Airtable table names exactly: `Workouts`, `Body Metrics`, `Goals`.
- Weight unit is owner's choice but displayed consistently as `kg` in v1 (single place: `UNIT_WEIGHT` constant).
- Mobile-first: sections stack single-column on narrow screens, grid on `md+`.

---

## File Structure

- `app/page.tsx` — Server Component dashboard page; fetches + composes sections.
- `app/layout.tsx` — root layout, Tailwind globals, page title.
- `app/globals.css` — Tailwind directives.
- `middleware.ts` — Basic Auth gate.
- `lib/types.ts` — shared domain types + constants.
- `lib/airtable-map.ts` — pure record→model mapping functions.
- `lib/airtable.ts` — server-only fetch layer using the `airtable` SDK.
- `lib/metrics.ts` — pure derivation functions (streak, weekly count, etc.).
- `lib/auth.ts` — pure credential-check helper used by middleware.
- `components/KpiCards.tsx`, `WeightTrend.tsx`, `GoalProgress.tsx`, `ConsistencyHeatmap.tsx`, `RecentWorkouts.tsx` — presentational.
- `tests/*.test.ts` — Vitest unit tests.
- `.env.example`, `README.md`.

---

## Task 1: Scaffold project + tooling

**Files:**
- Create: project root via `create-next-app`
- Create: `vitest.config.ts`, `.env.example`
- Modify: `package.json` (scripts, deps)

**Interfaces:**
- Consumes: nothing.
- Produces: a running Next.js app (`npm run dev`) and a working test runner (`npm test`).

- [ ] **Step 1: Scaffold Next.js app in current directory**

Run (the trailing `.` scaffolds into the current folder; it must be empty except `docs/`):
```bash
npx create-next-app@latest . --typescript --tailwind --app --eslint --src-dir=false --import-alias "@/*" --no-turbopack
```
Expected: prompts auto-answered by flags; `app/`, `package.json`, `tailwind.config.ts` created. If it refuses due to existing `docs/` files, move `docs/` aside, scaffold, then move it back.

- [ ] **Step 2: Install runtime + test dependencies**

```bash
npm install airtable recharts
npm install -D vitest
```
Expected: packages added to `package.json`.

- [ ] **Step 3: Add Vitest config**

Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
```

- [ ] **Step 4: Add test script**

In `package.json`, add to `"scripts"`:
```json
"test": "vitest run"
```

- [ ] **Step 5: Create `.env.example`**

```bash
AIRTABLE_PAT=your_personal_access_token
AIRTABLE_BASE_ID=app_xxxxxxxxxxxxxx
DASHBOARD_PASSWORD=choose_a_password
```

- [ ] **Step 6: Verify dev server and tests boot**

Run:
```bash
npm run build
```
Expected: build succeeds (default starter page compiles).

Run:
```bash
npm test
```
Expected: Vitest runs and reports "no test files found" (exit 0 or a clear no-tests message). That's fine — tests come next.

- [ ] **Step 7: Commit**

```bash
git init && git add -A && git commit -m "chore: scaffold Next.js fitness dashboard"
```

---

## Task 2: Domain types + Airtable mapping

**Files:**
- Create: `lib/types.ts`
- Create: `lib/airtable-map.ts`
- Test: `tests/airtable-map.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - Types `Workout`, `BodyMetric`, `Goal`, `WorkoutType`, `GoalStatus`; constant `UNIT_WEIGHT`.
  - `mapWorkout(rec: RawRecord): Workout`
  - `mapBodyMetric(rec: RawRecord): BodyMetric`
  - `mapGoal(rec: RawRecord): Goal`
  - where `RawRecord = { id: string; fields: Record<string, unknown> }`.

- [ ] **Step 1: Create types**

Create `lib/types.ts`:
```ts
export const UNIT_WEIGHT = "kg";

export type WorkoutType = "Strength" | "Cardio" | "Mobility";
export type GoalStatus = "On track" | "At risk" | "Done";

export interface Workout {
  id: string;
  date: string; // ISO "YYYY-MM-DD"
  type: WorkoutType;
  durationMin: number;
  notes?: string;
}

export interface BodyMetric {
  id: string;
  date: string; // ISO "YYYY-MM-DD"
  weight: number;
  bodyFatPct?: number;
}

export interface Goal {
  id: string;
  name: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  targetDate?: string;
  status: GoalStatus;
}

export interface RawRecord {
  id: string;
  fields: Record<string, unknown>;
}
```

- [ ] **Step 2: Write failing tests for mapping**

Create `tests/airtable-map.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { mapWorkout, mapBodyMetric, mapGoal } from "@/lib/airtable-map";

describe("mapWorkout", () => {
  it("maps fields to a Workout", () => {
    const rec = {
      id: "rec1",
      fields: { Date: "2026-06-20", Type: "Strength", Duration: 60, Notes: "legs" },
    };
    expect(mapWorkout(rec)).toEqual({
      id: "rec1",
      date: "2026-06-20",
      type: "Strength",
      durationMin: 60,
      notes: "legs",
    });
  });

  it("defaults duration to 0 and omits empty notes", () => {
    const rec = { id: "rec2", fields: { Date: "2026-06-21", Type: "Cardio" } };
    expect(mapWorkout(rec)).toEqual({
      id: "rec2",
      date: "2026-06-21",
      type: "Cardio",
      durationMin: 0,
    });
  });
});

describe("mapBodyMetric", () => {
  it("maps weight and body fat", () => {
    const rec = { id: "b1", fields: { Date: "2026-06-20", Weight: 80, "Body fat %": 18 } };
    expect(mapBodyMetric(rec)).toEqual({
      id: "b1",
      date: "2026-06-20",
      weight: 80,
      bodyFatPct: 18,
    });
  });
});

describe("mapGoal", () => {
  it("maps a goal with defaults", () => {
    const rec = {
      id: "g1",
      fields: { Name: "Bench 100kg", "Target value": 100, "Current value": 80, Unit: "kg", Status: "On track" },
    };
    expect(mapGoal(rec)).toEqual({
      id: "g1",
      name: "Bench 100kg",
      targetValue: 100,
      currentValue: 80,
      unit: "kg",
      status: "On track",
    });
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `mapWorkout` (and siblings) not found.

- [ ] **Step 4: Implement mapping**

Create `lib/airtable-map.ts`:
```ts
import { RawRecord, Workout, BodyMetric, Goal, WorkoutType, GoalStatus } from "./types";

const str = (v: unknown): string | undefined =>
  typeof v === "string" && v.trim() !== "" ? v : undefined;
const num = (v: unknown): number | undefined =>
  typeof v === "number" ? v : undefined;

export function mapWorkout(rec: RawRecord): Workout {
  const f = rec.fields;
  const w: Workout = {
    id: rec.id,
    date: str(f["Date"]) ?? "",
    type: (str(f["Type"]) as WorkoutType) ?? "Strength",
    durationMin: num(f["Duration"]) ?? 0,
  };
  const notes = str(f["Notes"]);
  if (notes) w.notes = notes;
  return w;
}

export function mapBodyMetric(rec: RawRecord): BodyMetric {
  const f = rec.fields;
  const m: BodyMetric = {
    id: rec.id,
    date: str(f["Date"]) ?? "",
    weight: num(f["Weight"]) ?? 0,
  };
  const bf = num(f["Body fat %"]);
  if (bf !== undefined) m.bodyFatPct = bf;
  return m;
}

export function mapGoal(rec: RawRecord): Goal {
  const f = rec.fields;
  const g: Goal = {
    id: rec.id,
    name: str(f["Name"]) ?? "",
    targetValue: num(f["Target value"]) ?? 0,
    currentValue: num(f["Current value"]) ?? 0,
    unit: str(f["Unit"]) ?? "",
    status: (str(f["Status"]) as GoalStatus) ?? "On track",
  };
  const td = str(f["Target date"]);
  if (td) g.targetDate = td;
  return g;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test`
Expected: PASS (all mapping tests green).

- [ ] **Step 6: Commit**

```bash
git add lib/types.ts lib/airtable-map.ts tests/airtable-map.test.ts
git commit -m "feat: domain types and Airtable record mapping"
```

---

## Task 3: Airtable fetch layer (server-only)

**Files:**
- Create: `lib/airtable.ts`
- Test: `tests/airtable.test.ts`

**Interfaces:**
- Consumes: `mapWorkout`, `mapBodyMetric`, `mapGoal` (Task 2).
- Produces (all `async`, server-only):
  - `getWorkouts(): Promise<Workout[]>`
  - `getBodyMetrics(): Promise<BodyMetric[]>`
  - `getGoals(): Promise<Goal[]>`
  - `getDashboardData(): Promise<{ workouts: Workout[]; bodyMetrics: BodyMetric[]; goals: Goal[] }>`

- [ ] **Step 1: Write failing test for table fetch (SDK mocked)**

Create `tests/airtable.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the airtable SDK before importing the module under test.
const selectAll = vi.fn();
const table = vi.fn(() => ({ select: () => ({ all: selectAll }) }));
const base = vi.fn(() => table);
vi.mock("airtable", () => ({
  default: class {
    base() {
      return base();
    }
  },
}));

beforeEach(() => {
  vi.resetModules();
  process.env.AIRTABLE_PAT = "pat";
  process.env.AIRTABLE_BASE_ID = "appX";
  selectAll.mockReset();
});

describe("getWorkouts", () => {
  it("returns mapped workouts", async () => {
    selectAll.mockResolvedValue([
      { id: "rec1", fields: { Date: "2026-06-20", Type: "Strength", Duration: 45 } },
    ]);
    const { getWorkouts } = await import("@/lib/airtable");
    const result = await getWorkouts();
    expect(result).toEqual([
      { id: "rec1", date: "2026-06-20", type: "Strength", durationMin: 45 },
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `@/lib/airtable` not found.

- [ ] **Step 3: Implement fetch layer**

Create `lib/airtable.ts`:
```ts
import "server-only";
import Airtable from "airtable";
import { mapWorkout, mapBodyMetric, mapGoal } from "./airtable-map";
import { Workout, BodyMetric, Goal, RawRecord } from "./types";

function getBase() {
  const pat = process.env.AIRTABLE_PAT;
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!pat || !baseId) {
    throw new Error("Missing AIRTABLE_PAT or AIRTABLE_BASE_ID env var");
  }
  return new Airtable({ apiKey: pat }).base(baseId);
}

async function fetchTable(name: string): Promise<RawRecord[]> {
  const records = await getBase()(name).select().all();
  return records.map((r) => ({ id: r.id, fields: r.fields as Record<string, unknown> }));
}

export async function getWorkouts(): Promise<Workout[]> {
  return (await fetchTable("Workouts")).map(mapWorkout);
}

export async function getBodyMetrics(): Promise<BodyMetric[]> {
  return (await fetchTable("Body Metrics")).map(mapBodyMetric);
}

export async function getGoals(): Promise<Goal[]> {
  return (await fetchTable("Goals")).map(mapGoal);
}

export async function getDashboardData() {
  const [workouts, bodyMetrics, goals] = await Promise.all([
    getWorkouts(),
    getBodyMetrics(),
    getGoals(),
  ]);
  return { workouts, bodyMetrics, goals };
}
```

> Note: `import "server-only"` makes the build fail loudly if this file is ever imported into a Client Component. Install it if not already present: `npm install server-only`.

- [ ] **Step 4: Install server-only guard**

```bash
npm install server-only
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/airtable.ts tests/airtable.test.ts package.json package-lock.json
git commit -m "feat: server-only Airtable fetch layer"
```

---

## Task 4: Metrics derivation (pure functions)

**Files:**
- Create: `lib/metrics.ts`
- Test: `tests/metrics.test.ts`

**Interfaces:**
- Consumes: `Workout`, `BodyMetric`, `Goal` (Task 2).
- Produces:
  - `workoutsThisWeek(workouts: Workout[], today: string): number` — count with date in the last 7 days inclusive of `today`.
  - `currentStreak(workouts: Workout[], today: string): number` — consecutive calendar days with ≥1 workout, counting back from `today`; if `today` has none but the prior day does, the streak still counts from that prior day.
  - `latestWeight(metrics: BodyMetric[]): number | null` — weight of the most recent dated metric, or null.
  - `goalsOnTrack(goals: Goal[]): number` — count of status `On track` or `Done`.
  - `weightSeries(metrics: BodyMetric[]): { date: string; weight: number }[]` — sorted ascending by date.
  - `consistencyMap(workouts: Workout[], today: string, days: number): { date: string; count: number }[]` — one entry per day for the last `days` days ending `today`, ascending.

  All dates are ISO `"YYYY-MM-DD"` strings; functions compare lexicographically / by day arithmetic, never via `Date.now()`.

- [ ] **Step 1: Write failing tests**

Create `tests/metrics.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import {
  workoutsThisWeek,
  currentStreak,
  latestWeight,
  goalsOnTrack,
  weightSeries,
  consistencyMap,
} from "@/lib/metrics";
import { Workout, BodyMetric, Goal } from "@/lib/types";

const w = (date: string): Workout => ({ id: date, date, type: "Strength", durationMin: 30 });

describe("workoutsThisWeek", () => {
  it("counts workouts within the last 7 days inclusive", () => {
    const data = [w("2026-06-28"), w("2026-06-22"), w("2026-06-21")];
    expect(workoutsThisWeek(data, "2026-06-28")).toBe(2); // 28 and 22, not 21
  });
});

describe("currentStreak", () => {
  it("counts consecutive days ending today", () => {
    const data = [w("2026-06-28"), w("2026-06-27"), w("2026-06-26")];
    expect(currentStreak(data, "2026-06-28")).toBe(3);
  });
  it("allows today to be missing if yesterday has a workout", () => {
    const data = [w("2026-06-27"), w("2026-06-26")];
    expect(currentStreak(data, "2026-06-28")).toBe(2);
  });
  it("is zero when the most recent workout is older than yesterday", () => {
    const data = [w("2026-06-25")];
    expect(currentStreak(data, "2026-06-28")).toBe(0);
  });
});

describe("latestWeight", () => {
  it("returns the most recent weight", () => {
    const m: BodyMetric[] = [
      { id: "1", date: "2026-06-20", weight: 81 },
      { id: "2", date: "2026-06-27", weight: 80 },
    ];
    expect(latestWeight(m)).toBe(80);
  });
  it("returns null for empty", () => {
    expect(latestWeight([])).toBeNull();
  });
});

describe("goalsOnTrack", () => {
  it("counts On track and Done", () => {
    const g: Goal[] = [
      { id: "1", name: "a", targetValue: 1, currentValue: 1, unit: "kg", status: "On track" },
      { id: "2", name: "b", targetValue: 1, currentValue: 0, unit: "kg", status: "At risk" },
      { id: "3", name: "c", targetValue: 1, currentValue: 1, unit: "kg", status: "Done" },
    ];
    expect(goalsOnTrack(g)).toBe(2);
  });
});

describe("weightSeries", () => {
  it("sorts ascending by date", () => {
    const m: BodyMetric[] = [
      { id: "1", date: "2026-06-27", weight: 80 },
      { id: "2", date: "2026-06-20", weight: 81 },
    ];
    expect(weightSeries(m)).toEqual([
      { date: "2026-06-20", weight: 81 },
      { date: "2026-06-27", weight: 80 },
    ]);
  });
});

describe("consistencyMap", () => {
  it("returns one entry per day with workout counts", () => {
    const data = [w("2026-06-28"), w("2026-06-28"), w("2026-06-26")];
    const result = consistencyMap(data, "2026-06-28", 3);
    expect(result).toEqual([
      { date: "2026-06-26", count: 1 },
      { date: "2026-06-27", count: 0 },
      { date: "2026-06-28", count: 2 },
    ]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — functions not found.

- [ ] **Step 3: Implement metrics**

Create `lib/metrics.ts`:
```ts
import { Workout, BodyMetric, Goal } from "./types";

// --- date helpers (UTC day arithmetic on "YYYY-MM-DD" strings) ---
function toDayNum(iso: string): number {
  return Math.floor(Date.parse(iso + "T00:00:00Z") / 86_400_000);
}
function fromDayNum(n: number): string {
  return new Date(n * 86_400_000).toISOString().slice(0, 10);
}

export function workoutsThisWeek(workouts: Workout[], today: string): number {
  const end = toDayNum(today);
  const start = end - 6;
  return workouts.filter((wk) => {
    if (!wk.date) return false;
    const d = toDayNum(wk.date);
    return d >= start && d <= end;
  }).length;
}

export function currentStreak(workouts: Workout[], today: string): number {
  const days = new Set(workouts.filter((wk) => wk.date).map((wk) => toDayNum(wk.date)));
  const end = toDayNum(today);
  let cursor = days.has(end) ? end : days.has(end - 1) ? end - 1 : null;
  if (cursor === null) return 0;
  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor--;
  }
  return streak;
}

export function latestWeight(metrics: BodyMetric[]): number | null {
  const dated = metrics.filter((m) => m.date);
  if (dated.length === 0) return null;
  const latest = dated.reduce((a, b) => (toDayNum(b.date) > toDayNum(a.date) ? b : a));
  return latest.weight;
}

export function goalsOnTrack(goals: Goal[]): number {
  return goals.filter((g) => g.status === "On track" || g.status === "Done").length;
}

export function weightSeries(metrics: BodyMetric[]): { date: string; weight: number }[] {
  return metrics
    .filter((m) => m.date)
    .slice()
    .sort((a, b) => toDayNum(a.date) - toDayNum(b.date))
    .map((m) => ({ date: m.date, weight: m.weight }));
}

export function consistencyMap(
  workouts: Workout[],
  today: string,
  days: number
): { date: string; count: number }[] {
  const counts = new Map<number, number>();
  for (const wk of workouts) {
    if (!wk.date) continue;
    const d = toDayNum(wk.date);
    counts.set(d, (counts.get(d) ?? 0) + 1);
  }
  const end = toDayNum(today);
  const out: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = end - i;
    out.push({ date: fromDayNum(d), count: counts.get(d) ?? 0 });
  }
  return out;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/metrics.ts tests/metrics.test.ts
git commit -m "feat: metric derivation functions"
```

---

## Task 5: Password gate middleware

**Files:**
- Create: `lib/auth.ts`
- Create: `middleware.ts`
- Test: `tests/auth.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `checkBasicAuth(header: string | null, password: string): boolean` — parses an `Authorization: Basic ...` header and returns true iff the decoded password matches (username ignored).

- [ ] **Step 1: Write failing tests**

Create `tests/auth.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { checkBasicAuth } from "@/lib/auth";

function header(user: string, pass: string): string {
  return "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");
}

describe("checkBasicAuth", () => {
  it("accepts the correct password (any username)", () => {
    expect(checkBasicAuth(header("me", "secret"), "secret")).toBe(true);
  });
  it("rejects a wrong password", () => {
    expect(checkBasicAuth(header("me", "nope"), "secret")).toBe(false);
  });
  it("rejects a missing header", () => {
    expect(checkBasicAuth(null, "secret")).toBe(false);
  });
  it("rejects a non-Basic header", () => {
    expect(checkBasicAuth("Bearer xyz", "secret")).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `checkBasicAuth` not found.

- [ ] **Step 3: Implement auth helper**

Create `lib/auth.ts`:
```ts
export function checkBasicAuth(header: string | null, password: string): boolean {
  if (!header || !header.startsWith("Basic ")) return false;
  let decoded: string;
  try {
    decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
  } catch {
    return false;
  }
  const idx = decoded.indexOf(":");
  const supplied = idx === -1 ? decoded : decoded.slice(idx + 1);
  // constant-time-ish compare
  if (supplied.length !== password.length) return false;
  let diff = 0;
  for (let i = 0; i < supplied.length; i++) {
    diff |= supplied.charCodeAt(i) ^ password.charCodeAt(i);
  }
  return diff === 0;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Add the middleware**

Create `middleware.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { checkBasicAuth } from "@/lib/auth";

export function middleware(req: NextRequest) {
  const password = process.env.DASHBOARD_PASSWORD;
  if (!password) {
    return new NextResponse("Server misconfigured: DASHBOARD_PASSWORD not set", { status: 500 });
  }
  if (checkBasicAuth(req.headers.get("authorization"), password)) {
    return NextResponse.next();
  }
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Fitness Dashboard"' },
  });
}

export const config = {
  // Protect everything except Next internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

- [ ] **Step 6: Commit**

```bash
git add lib/auth.ts middleware.ts tests/auth.test.ts
git commit -m "feat: password gate via Basic Auth middleware"
```

---

## Task 6: UI components + dashboard page

**Files:**
- Create: `components/KpiCards.tsx`, `components/WeightTrend.tsx`, `components/GoalProgress.tsx`, `components/ConsistencyHeatmap.tsx`, `components/RecentWorkouts.tsx`
- Modify: `app/page.tsx`, `app/layout.tsx`
- Test: `tests/components.test.tsx` (one smoke test for a pure component)

**Interfaces:**
- Consumes: types from Task 2, metrics from Task 4, `getDashboardData` from Task 3, `UNIT_WEIGHT`.
- Produces: a rendered dashboard at `/`.

- [ ] **Step 1: KPI cards (presentational)**

Create `components/KpiCards.tsx`:
```tsx
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
```

- [ ] **Step 2: Weight trend chart (client component)**

Create `components/WeightTrend.tsx`:
```tsx
"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { UNIT_WEIGHT } from "@/lib/types";

interface Props {
  data: { date: string; weight: number }[];
}

export function WeightTrend({ data }: Props) {
  return (
    <section className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
      <h2 className="mb-3 text-sm font-medium text-neutral-300">Weight ({UNIT_WEIGHT})</h2>
      {data.length === 0 ? (
        <p className="text-sm text-neutral-500">No weight entries yet.</p>
      ) : (
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke="#38bdf8" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 3: Goal progress (presentational)**

Create `components/GoalProgress.tsx`:
```tsx
import { Goal } from "@/lib/types";

export function GoalProgress({ goals }: { goals: Goal[] }) {
  return (
    <section className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
      <h2 className="mb-3 text-sm font-medium text-neutral-300">Goals</h2>
      {goals.length === 0 ? (
        <p className="text-sm text-neutral-500">No goals yet.</p>
      ) : (
        <ul className="space-y-3">
          {goals.map((g) => {
            const pct = g.targetValue > 0 ? Math.min(100, Math.round((g.currentValue / g.targetValue) * 100)) : 0;
            return (
              <li key={g.id}>
                <div className="flex justify-between text-sm">
                  <span>{g.name}</span>
                  <span className="text-neutral-400">
                    {g.currentValue}/{g.targetValue} {g.unit}
                  </span>
                </div>
                <div className="mt-1 h-2 rounded bg-white/10">
                  <div className="h-2 rounded bg-sky-400" style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
```

- [ ] **Step 4: Consistency heatmap (presentational)**

Create `components/ConsistencyHeatmap.tsx`:
```tsx
export function ConsistencyHeatmap({ data }: { data: { date: string; count: number }[] }) {
  const shade = (count: number) =>
    count === 0 ? "bg-white/5" : count === 1 ? "bg-sky-700" : count === 2 ? "bg-sky-500" : "bg-sky-300";
  return (
    <section className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
      <h2 className="mb-3 text-sm font-medium text-neutral-300">Consistency (last {data.length} days)</h2>
      <div className="flex flex-wrap gap-1">
        {data.map((d) => (
          <div key={d.date} title={`${d.date}: ${d.count}`} className={`h-4 w-4 rounded-sm ${shade(d.count)}`} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Recent workouts table (presentational)**

Create `components/RecentWorkouts.tsx`:
```tsx
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
```

- [ ] **Step 6: Smoke test a pure component**

First switch the Vitest environment so JSX renders. Update `vitest.config.ts` `test.environment` to `"jsdom"` and install deps:
```bash
npm install -D jsdom @testing-library/react @vitejs/plugin-react
```
Add the React plugin to `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});
```
Create `tests/components.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KpiCards } from "@/components/KpiCards";

describe("KpiCards", () => {
  it("renders the streak and an em dash for missing weight", () => {
    render(
      <KpiCards workoutsThisWeek={3} currentStreak={5} latestWeight={null} goalsOnTrack={1} goalsTotal={2} />
    );
    expect(screen.getByText("5 d")).toBeTruthy();
    expect(screen.getByText("—")).toBeTruthy();
    expect(screen.getByText("1/2")).toBeTruthy();
  });
});
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `npm test`
Expected: PASS (all suites, including the new component smoke test).

- [ ] **Step 8: Compose the page**

Replace `app/page.tsx`:
```tsx
import { getDashboardData } from "@/lib/airtable";
import {
  workoutsThisWeek,
  currentStreak,
  latestWeight,
  goalsOnTrack,
  weightSeries,
  consistencyMap,
} from "@/lib/metrics";
import { KpiCards } from "@/components/KpiCards";
import { WeightTrend } from "@/components/WeightTrend";
import { GoalProgress } from "@/components/GoalProgress";
import { ConsistencyHeatmap } from "@/components/ConsistencyHeatmap";
import { RecentWorkouts } from "@/components/RecentWorkouts";

export const revalidate = 60;

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function Page() {
  let data;
  try {
    data = await getDashboardData();
  } catch (e) {
    return (
      <main className="mx-auto max-w-3xl p-4">
        <h1 className="text-xl font-semibold">Fitness Dashboard</h1>
        <p className="mt-4 rounded bg-red-500/10 p-3 text-sm text-red-300">
          Could not load data: {(e as Error).message}
        </p>
      </main>
    );
  }

  const today = todayISO();
  const { workouts, bodyMetrics, goals } = data;
  const recent = workouts
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 10);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold">Fitness Dashboard</h1>
      <KpiCards
        workoutsThisWeek={workoutsThisWeek(workouts, today)}
        currentStreak={currentStreak(workouts, today)}
        latestWeight={latestWeight(bodyMetrics)}
        goalsOnTrack={goalsOnTrack(goals)}
        goalsTotal={goals.length}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <WeightTrend data={weightSeries(bodyMetrics)} />
        <GoalProgress goals={goals} />
      </div>
      <ConsistencyHeatmap data={consistencyMap(workouts, today, 35)} />
      <RecentWorkouts workouts={recent} />
    </main>
  );
}
```

- [ ] **Step 9: Set the page background / metadata**

Replace `app/layout.tsx` body/metadata so it reads as a dark dashboard:
```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fitness Dashboard",
  description: "Personal fitness tracker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 10: Build to verify everything compiles**

Run: `npm run build`
Expected: build succeeds with no type errors. (Data fetch may warn if env vars are absent at build time — that's fine; the page catches errors at request time.)

- [ ] **Step 11: Commit**

```bash
git add app components tests/components.test.tsx vitest.config.ts package.json package-lock.json
git commit -m "feat: dashboard UI components and page composition"
```

---

## Task 7: Local run docs + Vercel deployment

**Files:**
- Create: `README.md`
- Verify: `.gitignore` includes `.env*.local` (Next.js default does)

**Interfaces:**
- Consumes: the full app.
- Produces: documented setup + a live Vercel URL.

- [ ] **Step 1: Write README**

Create `README.md`:
```markdown
# Fitness Dashboard

Private, mobile-friendly dashboard reading personal fitness data from Airtable.

## Airtable setup
Create three tables in your base:
- **Workouts**: Date (date), Type (single select: Strength/Cardio/Mobility), Duration (number, minutes), Notes (long text).
- **Body Metrics**: Date (date), Weight (number), Body fat % (number, optional).
- **Goals**: Name (text), Target value (number), Current value (number), Unit (text), Target date (date, optional), Status (single select: On track/At risk/Done).

Create a Personal Access Token (Airtable → Builder hub → Personal access tokens)
with scope `data.records:read` on this base.

## Run locally
1. `cp .env.example .env.local` and fill in `AIRTABLE_PAT`, `AIRTABLE_BASE_ID`, `DASHBOARD_PASSWORD`.
2. `npm install`
3. `npm run dev` → open http://localhost:3000 (browser prompts for password; username can be anything).

## Test
`npm test`

## Deploy to Vercel
1. `npm i -g vercel` (once).
2. `vercel` → link/create the project.
3. Add env vars: `vercel env add AIRTABLE_PAT`, `vercel env add AIRTABLE_BASE_ID`, `vercel env add DASHBOARD_PASSWORD` (Production + Preview).
4. `vercel --prod` → open the URL on your phone; enter the password when prompted.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: setup and Vercel deployment instructions"
```

- [ ] **Step 3: Deploy (manual, owner runs)**

Run:
```bash
npx vercel --prod
```
Expected: a `https://<project>.vercel.app` URL. Open it on the phone, enter the password, see the dashboard. If data is empty, add a few rows in Airtable and refresh (cache refreshes within ~60s).

---

## Self-Review Notes

- **Spec coverage:** Airtable structure → README Step 1 + mapping (Task 2); server-only token → Task 3 (`server-only`); KPI/trend/goals/heatmap/recent → Task 6; derived metrics not stored in Airtable → Task 4; password gate via middleware → Task 5; mobile-first responsive → Tailwind grids in Task 6; Vercel deploy + env vars → Task 7; error/empty states → page try/catch + per-component empty states (Task 6); unit tests for metrics + mapping + auth → Tasks 2,4,5. All covered.
- **Out of scope (per spec):** Exercises table, write/logging, date-range filters — intentionally omitted.
- **Type consistency:** function names/signatures in the `Interfaces` blocks match their implementations and call sites in `app/page.tsx`.
