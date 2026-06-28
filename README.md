# Gym Dashboard

My personal gym progress tracker — a private dashboard I built for myself to keep an
eye on my nutrition and bodyweight and stay on plan.

It pulls my own data from Airtable (my "Aggregate Gym Profile" base) and shows it at a
glance:

- **Bodyweight** — my weight trend over time from daily check-ins
- **Calories & macros** — what I logged versus my target for the day
- **Meal plan** — my training-day and non-training-day meals, slot by slot

Just for me, on my phone.

## Setup

The dashboard reads from Airtable server-side, so it needs two env vars in `.env`:

- `AIRTABLE_PAT` — an Airtable personal access token with `data.records:read` on the base
  (Airtable → Builder hub → Personal access tokens).
- `AIRTABLE_BASE_ID` — already set to my base.

Then `npm install`, `npm run dev`, open http://localhost:3000. The dashboard is public
(no login). Charts fill in once the **Check Ins** table has logged days; the meal plan
and targets show as soon as a valid token is in place.
