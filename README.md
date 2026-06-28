# Fitness Dashboard

Private, mobile-friendly dashboard reading personal fitness data from Airtable.

## Airtable setup
Create three tables in your base:
- **Workouts**: Date (date), Type (single select: Strength/Cardio/Mobility), Duration (number, minutes), Notes (long text).
- **Body Metrics**: Date (date), Weight (number), Body fat % (number, optional).
- **Goals**: Name (text), Target value (number), Current value (number), Unit (text), Target date (date, optional), Status (single select: On track/At risk/Done).

Create a Personal Access Token (Airtable → Developer hub → Personal access tokens)
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
