# CarePath Deployment Guide
**Stack: Neon (DB) → Render (API) → Vercel (UI)**
All three services are free tier. No credit card required to start.

---

## Step 1: Database — Neon

1. Go to https://neon.tech and sign up with GitHub
2. Create a new project → name it `carepath`
3. Copy the **Connection string** — it looks like:
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Save this — you'll need it for Render in Step 2

---

## Step 2: API — Render

1. Go to https://render.com and sign up with GitHub
2. Click **New → Web Service**
3. Connect your GitHub repo: `Debalent/CarePath`
4. Render will auto-detect `render.yaml` — confirm the settings:
   - **Name:** carepath-api
   - **Build Command:** `npm install && npm run build && npx prisma generate && npx prisma migrate deploy`
   - **Start Command:** `npm run start`
5. Add the following **Environment Variables** in the Render dashboard:
   | Key | Value |
   |---|---|
   | `DATABASE_URL` | Your Neon connection string from Step 1 |
   | `JWT_SECRET` | Any long random string (e.g. `carepath-super-secret-2026`) |
   | `JWT_EXPIRES_IN` | `7d` |
   | `NODE_ENV` | `production` |
   | `PORT` | `3001` |
   | `ALLOWED_ORIGINS` | Your Vercel URL (add after Step 3, e.g. `https://carepath-ui.vercel.app`) |
   | `TWILIO_ACCOUNT_SID` | Your Twilio SID (or leave blank for dry-run mode) |
   | `TWILIO_AUTH_TOKEN` | Your Twilio token (or leave blank) |
   | `TWILIO_PHONE_NUMBER` | Your Twilio number (or leave blank) |
6. Click **Deploy** — wait for the build to complete (~3 minutes)
7. Test it: visit `https://carepath-api.onrender.com/health` — you should see:
   ```json
   { "status": "ok", "service": "CarePath API" }
   ```
8. Seed demo data:
   - In Render dashboard → your service → **Shell**
   - Run: `node scripts/seed.js`

---

## Step 3: UI — Vercel

1. Go to https://vercel.com and sign up with GitHub
2. Click **Add New → Project**
3. Import your GitHub repo: `Debalent/CarePath`
4. Set the **Root Directory** to `carepath-ui`
5. Vercel auto-detects Next.js — no framework config needed
6. Add the following **Environment Variable**:
   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | Your Render API URL, e.g. `https://carepath-api.onrender.com` |
7. Click **Deploy** — live in ~2 minutes
8. Go back to Render and update `ALLOWED_ORIGINS` with your Vercel URL

---

## Step 4: Verify Everything Works

Run through this checklist before demo day:

- [ ] `https://your-app.vercel.app` loads the landing page
- [ ] Register a new patient account
- [ ] Log in and reach the patient dashboard
- [ ] Submit a ride request
- [ ] Log in as coordinator and see the ride in the pooling hub
- [ ] Assign a driver
- [ ] Log in as driver and move ride to COMPLETED
- [ ] Post-ride survey appears

---

## Local Development (unchanged)

```bash
# API
npm run dev          # http://localhost:3001

# UI
cd carepath-ui
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev          # http://localhost:3000
```

---

## Render Free Tier Note

Render free tier services **spin down after 15 minutes of inactivity** and take ~30 seconds to wake up on the first request. For demo day, open the app and make one API call at least 2 minutes before you present to ensure it's warm.

To keep it warm during the demo, you can use a free uptime monitor like https://uptimerobot.com — add a monitor pinging `https://carepath-api.onrender.com/health` every 5 minutes.

---

*CarePath · Vercel + Render + Neon deployment · July 2026*
