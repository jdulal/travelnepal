# Nepal Travel

A complete travel management system for trekking, tours and local experiences in Nepal, built with Next.js 15 (App Router) and MySQL/MariaDB. The public site covers discovery, booking and an AI trip planner; the admin console covers operations, content, people and reporting.

## Features

**Public site**
- Home, trekking and tours catalogues with destination, difficulty, duration, price and sort filters
- Trip pages with day-by-day itinerary, departures, gallery, reviews, inclusions and FAQs
- Booking and checkout flow with traveller details, add-ons, coupons and 20% deposit
- Destinations, travel stories, traveller community and contact pages
- AI itinerary builder (`/itinerary`) with shareable saved plans
- Floating AI assistant with chat plus landmark, receipt and food analysis tools (works offline with built-in rules; add an OpenAI-compatible key for live model output)

**Traveller dashboard**
- Bookings, saved trips, AI plans, notifications, assistant chats, expense scans and account settings

**Admin console** (`/admin`)
- Overview with revenue chart, booking pipeline, top trips, latest bookings and activity feed
- Bookings: status and payment updates, seat accounting, payment records, notifications, CSV export
- Trips: full editor, itinerary day editor, departures, bulk departure import
- Destinations, customers (roles/status), reviews, community posts, stories, inquiries, newsletter
- Coupons, FAQs and testimonials, site settings, activity log
- CSV exports for bookings, users, newsletter and inquiries

## Tech stack

- Next.js 15.5, React 19, TypeScript (strict)
- Tailwind CSS 3.4 with a custom Nepal Travel theme (brand green, forest, mist, Jost/Plus Jakarta Sans)
- MySQL 8 / MariaDB via `mysql2/promise`, raw parameterised SQL, InnoDB and utf8mb4
- JWT session cookie (`jose`) with bcrypt password hashing
- Recharts for admin reporting, Zod for server-side form validation, Lucide icons

## Quick start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env.local
   ```

   Set `SESSION_SECRET` to a long random string. Point `DB_*` at your database. The defaults target the bundled local MariaDB instance on port `3307`.

3. **Start the local database (optional)**

   ```bash
   npm run db:start
   ```

   This uses the XAMPP MariaDB binaries (`D:/xampp/mysql/bin` by default) and the data directory in `.mysql-data/`. Set `XAMPP_MYSQL_BIN` if yours is elsewhere. If you already run MySQL elsewhere, skip this and update `.env.local`.

4. **Create schema and seed demo content**

   ```bash
   npm run db:setup
   ```

   Use `npm run db:reset` to drop and reseed. The seed creates destinations, trips, departures, stories, reviews, community posts, coupons, bookings, plans and demo users.

5. **Run**

   ```bash
   npm run dev
   ```

   Site: <http://localhost:3000> · Admin: <http://localhost:3000/admin>

## Demo accounts

| Role | Username | Password |
| --- | --- | --- |
| Administrator | `admin` | `Nepal@2026` |
| Traveller | `aayush` | `Traveler@2026` |

Sign in with either the username or email address. Change the admin password before deploying.

## AI configuration

The assistant and itinerary builder work without any external service by using a deterministic local planner. To use a live model, set an OpenAI-compatible endpoint in `.env.local`:

```env
AI_BASE_URL=https://api.openai.com/v1
AI_API_KEY=sk-...
AI_MODEL=gpt-4o-mini
```

Vision tools (landmark, receipt and food photos) use the same endpoint with image input. AI routes are rate-limited per IP.

## Database

Default connection: `127.0.0.1:3307`, user `root`, empty password, database `nepal_travel`. The app uses `dateStrings` with the `+05:45` timezone. Schema and seed SQL live in `database/` and `scripts/`.

Useful commands:

```bash
npm run db:start   # start bundled MariaDB
npm run db:stop    # stop it
npm run db:setup   # apply schema and seed
npm run db:reset   # drop, recreate and reseed
```

## Images

All photography is bundled under `public/images/` for offline-friendly, low-bandwidth delivery and a local fallback. Credits and licences are listed in [`public/images/ATTRIBUTIONS.md`](public/images/ATTRIBUTIONS.md). `scripts/fetch-images.mjs` re-downloads landscape assets from Wikimedia Commons; `scripts/image-report.mjs` prints dimensions and file sizes.

## Security notes

- Passwords are hashed with bcrypt; sessions are signed JWTs in an httpOnly, sameSite cookie
- Middleware guards `/admin/*` and `/dashboard/*`, and every admin server action and CSV export re-checks the session and role
- All SQL uses parameterised queries; all form input is validated with Zod on the server
- Admin UI pages are `noindex`; admins cannot change their own role or block themselves
- AI endpoints are rate-limited; no secrets are exposed to the client

## Project structure

```text
src/app/(public)     Public site and booking flow
src/app/(auth)       Sign in / sign up
src/app/dashboard    Traveller dashboard
src/app/admin        Admin console and CSV export routes
src/app/actions      Server actions (admin, auth, booking, community, AI plans)
src/app/api          Search, saved trips and AI endpoints
src/lib              DB, queries, admin queries, auth, AI, guards, utilities
src/components       Site, dashboard and admin components
database/            Schema and supporting SQL
scripts/             Database setup, seed content, image tooling
```
