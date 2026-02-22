# External Cron Setup (Vercel Hobby)

On Vercel Hobby, crons can only run **once per day**. Two jobs need to run more often, so they are handled by an external service.

## Setup with cron-job.org (free)

1. Go to [cron-job.org](https://cron-job.org) and create a free account.
2. Add `CRON_SECRET` to your Vercel env vars (Settings → Environment Variables) if not already set. Generate a random string (e.g. `openssl rand -hex 32`).

### Job 1: Process scheduled posts (every 10 minutes)

- **URL:** `https://YOUR_APP.vercel.app/api/cron/process-posts`
- **Schedule:** `*/10 * * * *` (every 10 minutes)
- **Method:** GET
- **Request headers:**
  - `Authorization`: `Bearer YOUR_CRON_SECRET`

### Job 2: Sync analytics (every 6 hours)

- **URL:** `https://YOUR_APP.vercel.app/api/cron/sync-analytics`
- **Schedule:** `0 */6 * * *` (every 6 hours: midnight, 6am, noon, 6pm)
- **Method:** GET
- **Request headers:**
  - `Authorization`: `Bearer YOUR_CRON_SECRET`

Replace `YOUR_APP` with your Vercel project URL and `YOUR_CRON_SECRET` with the value from Vercel env vars.

## Crons still run by Vercel (daily)

- **process-trials** — 1:00 AM UTC  
- **process-recurring-billing** — 2:00 AM UTC  
- **trial-reminders** — 9:00 AM UTC  
