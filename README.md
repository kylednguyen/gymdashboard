# Gym Dashboard

My personal gym tracker — a zero-input dashboard. I never type data into it and it has
no forms: I just tell an AI assistant what I ate, lifted, or weighed, and this app is
the read-only snapshot of everything that's been logged.

## How it works

```
┌──────────────┐   natural language    ┌───────────────────┐   Airtable Web API
│  Me (chat)   │ ────────────────────▶ │  Claude + Airtable │ ────────────────────▶ ┌──────────────────────┐
│ "ate a leg   │                       │  MCP server        │   create/update rows  │  Airtable base       │
│  quarter +   │                       │  (tool calls)      │                       │  "Aggregate Gym      │
│  200g rice"  │                       └───────────────────┘                        │   Profile"           │
└──────────────┘                                                                    └──────────┬───────────┘
                                                                                               │ REST, PAT-scoped
                                                                                               │ data.records:read
                                                                                    ┌──────────▼───────────┐
                                                                 one tap/refresh   │  Next.js dashboard    │
                                                              ◀─────────────────── │  (this repo, RSC+ISR) │
                                                                                    └──────────────────────┘
```

1. **Capture — conversation, not forms.** I describe a meal, a workout, or a weigh-in in
   chat. Claude (via the Airtable MCP server's tool calls) estimates calories/macros,
   breaks workouts into one row per working set, and writes structured records into the
   base. The AI does the entity extraction and unit normalization; the schema below is
   the contract it fills.
2. **Store — Airtable is the single source of truth.** Five tables, keyed by ISO date,
   hold everything. There is no app database and no duplication of state.
3. **View — this app is a pure function of the base.** Opening the dashboard is the "one
   click": a React Server Component fetches all five tables in parallel and renders the
   snapshot. All interactivity (day browsing, range filters, drill-downs) is client-side
   over that already-fetched data — no further network round-trips, and never a write.

## Data model

| Airtable table   | Grain                         | Feeds                                    |
| ---------------- | ----------------------------- | ---------------------------------------- |
| `Check Ins`      | one row per day               | calorie/macro rings, weight trend, diary |
| `Daily Targets`  | one row per day type          | ring targets, adherence stats            |
| `Meal Templates` | one row per meal slot         | Meals → Plan accordions                  |
| `Meal Items`     | one row per food portion      | portions + option groups inside a slot   |
| `Workout Log`    | one row per working set       | Gym Diary drill-down, PRs, lift charts   |

`lib/airtable.ts` is the entire data layer. It is deliberately constrained:

- **`server-only`** — importing it from a Client Component fails the build, so the
  Airtable PAT can never leak into a browser bundle.
- **Read-only by construction** — every call goes through one `select().all()` helper;
  no create/update/destroy exists in the codebase, so the dashboard cannot mutate the
  base even by accident. Writes happen exclusively on the MCP side.
- **ISR, 60s** — the page exports `revalidate = 60`, so Next.js statically caches the
  rendered snapshot and refetches in the background at most once a minute. Log something
  in chat, pull-to-refresh a minute later, and it's on the dashboard.

`lib/airtable-map.ts` normalizes raw records into typed domain objects (`CheckIn`,
`WorkoutSet`, …). This layer absorbs schema drift from the AI-written side — e.g. the
live base's Check Ins select grew a bare `"Training"` choice alongside `"Training Day"`;
the mapper canonicalizes all variants so downstream code sees exactly two day types.
`lib/metrics.ts` holds the pure derivations (weight series, calories-vs-target,
per-exercise progress and PRs, trailing-window averages), all unit-tested.

## The snapshot

Four tabs, one screenful each, phone-first:

- **Log** — calorie ring + macro rings vs. that day type's targets, a day-picker strip
  to flip between logged days, and an expandable recent log.
- **Meals** — the plan (per day type, slot-by-slot accordions with portions and
  either/or option groups) and the eaten history, pre-selected from today's check-in.
- **Gym Diary** — days → exercises → per-lift progress chart, with all-time PR badges;
  lift chips jump straight to a lift's history.
- **Progress** — 1W/1M/3M/All ranges over the weight trend, logged-vs-target calorie
  chart, and adherence stats.

## Stack

Next.js 16 (App Router, RSC + ISR) · React 19 · Tailwind CSS v4 · shadcn/ui (vendored
Radix-based primitives in `components/ui/`) · Recharts · Vitest + Testing Library.

## Setup

The dashboard reads from Airtable server-side, so it needs two env vars in `.env`:

- `AIRTABLE_PAT` — an Airtable personal access token with `data.records:read` on the base
  (Airtable → Builder hub → Personal access tokens). Read scope only — the app never
  writes, so don't grant it more.
- `AIRTABLE_BASE_ID` — already set to my base.

Then `npm install`, `npm run dev`, open http://localhost:3000. The dashboard is public
(no login). Charts fill in once the **Check Ins** table has logged days; the meal plan
and targets show as soon as a valid token is in place.

`/preview` renders the full UI against in-repo sample data shaped like the live base —
useful for UI work without credentials. `npm test` runs the mapper/metrics/component
suites.
