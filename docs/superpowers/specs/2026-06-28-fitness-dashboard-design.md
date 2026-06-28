# Personal Fitness Dashboard — Design

**Date:** 2026-06-28
**Status:** Approved (design)

## Purpose

A private, single-user web dashboard that visualizes the owner's fitness data
pulled live from an existing Airtable base. Display-only: all data entry happens
in Airtable (web/mobile app); the dashboard never writes back.

## Goals

- See workout activity, body metrics, goal progress, and consistency at a glance.
- Keep the Airtable access token secret (never exposed to the browser).
- Run locally with `npm run dev`; deployed to Vercel (free tier) so it's
  reachable from a phone.
- Mobile-first responsive layout (primary device is a phone browser).
- Gate access with a single shared password (data is private).

## Non-Goals (v1)

- Logging or editing data from the dashboard (read-only).
- Multi-user accounts (single user, one shared password — see Access Control).
- Per-exercise set/rep/weight detail (deferred — see Future Enhancements).

## Approach

**Next.js (App Router) + React Server Components.** The dashboard page fetches
from Airtable inside a Server Component, so the Airtable token lives only in a
server-side env var and never reaches the client. No separate API/proxy service
is needed.

- **Stack:** Next.js (App Router) + TypeScript + Tailwind CSS + Recharts.
- **Data access:** official `airtable` npm SDK, called server-side only.
- **Caching:** `revalidate` of ~60s so the page is fast but stays current.

### Rejected alternatives

- **Vite SPA + serverless proxy:** requires a separate function just to hide the
  token — more moving parts for the same result.
- **Static site rebuilt on a schedule:** cheapest hosting, but data is stale
  between builds; poor fit for a frequently-updated tracker.

## Airtable Structure

The base exists but is mostly empty; the owner will set up these tables/fields.

### Table: Workouts
| Field | Type | Notes |
|---|---|---|
| Date | Date | session date |
| Type | Single select | Strength / Cardio / Mobility |
| Duration | Number | minutes |
| Notes | Long text | optional |

### Table: Body Metrics
| Field | Type | Notes |
|---|---|---|
| Date | Date | measurement date |
| Weight | Number | kg (or lb — owner's choice, kept consistent) |
| Body fat % | Number | optional |

### Table: Goals
| Field | Type | Notes |
|---|---|---|
| Name | Single line text | e.g. "Bench 100kg" |
| Target value | Number | |
| Current value | Number | manually updated, or latest known |
| Unit | Single line text | e.g. kg, min, reps |
| Target date | Date | optional |
| Status | Single select | On track / At risk / Done |

## Dashboard Layout (single page)

1. **KPI cards** (top row): workouts this week · current streak · latest weight ·
   goals on track.
2. **Weight trend**: line chart over time (Body Metrics).
3. **Goal progress**: progress bars, current vs target (Goals).
4. **Consistency heatmap**: calendar of active days, derived from Workout dates.
5. **Recent workouts**: table of the last ~10 sessions.

## Data Flow

```
Browser  ──>  Next.js Server Component (server)  ──>  Airtable API
                  reads AIRTABLE_PAT + AIRTABLE_BASE_ID
                  from .env.local; renders HTML server-side
```

Derived values (streak, workouts-this-week, consistency days) are computed in
server-side code from the Workouts records — not stored in Airtable.

## Components / Boundaries

- `lib/airtable.ts` — thin data layer: typed functions
  (`getWorkouts`, `getBodyMetrics`, `getGoals`) wrapping the SDK. Single place
  that knows about Airtable shapes.
- `lib/metrics.ts` — pure functions deriving streak, weekly counts, consistency
  map from raw records. Independently testable, no I/O.
- `app/page.tsx` — Server Component: fetches via `lib/airtable`, computes via
  `lib/metrics`, lays out the sections.
- Presentational components per section (`KpiCards`, `WeightTrend`,
  `GoalProgress`, `ConsistencyHeatmap`, `RecentWorkouts`) — receive plain props,
  no data fetching.
- `middleware.ts` — Basic Auth gate (see Access Control); the only auth surface.

## Access Control

A single shared password gate, enforced by Next.js **middleware** using HTTP
Basic Auth:

- Middleware runs on every route, compares the supplied password against the
  `DASHBOARD_PASSWORD` env var (constant-time compare).
- On mismatch/absent: return `401` with `WWW-Authenticate: Basic`, so the browser
  shows its native login prompt (works fine on mobile; browser remembers it).
- The Airtable token is never involved in auth and never sent to the client.

This is "good enough for personal data" — not hardened multi-user auth. It works
on the Vercel free tier (no Pro deployment-protection needed).

## Deployment

- Target: **Vercel free tier**, primary access from a phone browser.
- Env vars set in the Vercel project settings: `AIRTABLE_PAT`,
  `AIRTABLE_BASE_ID`, `DASHBOARD_PASSWORD`.
- Deploy via the Vercel CLI or Git integration. Document the steps in README.
- Layout is mobile-first responsive (Tailwind); cards/charts stack on narrow
  screens and spread into a grid on wider ones.

## Configuration

`.env.local` (gitignored, mirrored in Vercel project settings):
- `AIRTABLE_PAT` — Personal Access Token, scope `data.records:read` on the base.
- `AIRTABLE_BASE_ID` — the base id.
- `DASHBOARD_PASSWORD` — shared password for the access gate.

## Error Handling

- Missing env vars → clear startup error explaining what to set.
- Airtable request failure → page renders with a non-blocking error banner per
  section rather than crashing the whole dashboard.
- Empty tables → each section shows a friendly empty state.

## Testing

- Unit tests for `lib/metrics.ts` pure functions (streak, weekly count,
  consistency) against fixture records.
- `lib/airtable.ts` covered via a thin integration check / mock of the SDK.

## Future Enhancements (out of scope for v1)

- **Exercises table** linked to Workouts for per-lift sets/reps/weight, enabling
  PR tracking and per-exercise progression charts.
- Logging/editing from the dashboard (would add write scope + form components).
- Date-range filtering and per-type breakdowns.
