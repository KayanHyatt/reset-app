# r.e.s.e.t — Expo (React Native) Prototype

r.e.s.e.t is a women’s mental health & wellbeing app prototype built with **Expo (React Native)** and **TypeScript**.

Prototype includes:
- **Home**: daily snapshot + entry points
- **Log**: 5–10 minute daily survey-style check-in (local SQLite)
- **Journal**: text journaling (local SQLite; AI placeholder for later)
- **Explore**: scrollable page with horizontal carousels linking out
- **Community**: Supabase-backed feed + auth + Row Level Security (RLS)
- **Bottom tabs**: Home / Log / Journal / Community / Explore

---

## Tech Stack

Frontend
- Expo SDK (recent; worked while debugging on SDK 54)
- React Native + TypeScript
- React Navigation (bottom tabs)

Local persistence
- expo-sqlite (logs + journal entries)

Accounts + cloud sync
- Supabase Auth (email/password + OTP confirmation)
- Supabase Postgres (profiles + community posts) with RLS

---

## Requirements

- Node.js (LTS recommended)
- npm
- Expo Go on a real phone
- Supabase project (URL + publishable/anon key)

---

## Setup

### 1) Install deps

From the repo root (folder containing `App.tsx` and `package.json`):

```bash
npm install
```

### 2) Create `.env`

Create a `.env` file in the repo root:

```env
EXPO_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Where to find these in Supabase:
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Settings → API Keys → Publishable key (`sb_publishable_...`)
- `EXPO_PUBLIC_SUPABASE_URL`: Settings → Data API → Project URL

Do not commit `.env`. This repo should ignore it via `.gitignore`.

### 3) Run (recommended for real device via Expo Go)

```bash
npx expo start --tunnel
```

If env vars changed or Metro cache is stuck:

```bash
npx expo start -c --tunnel
```

---

## Auth Notes (Supabase Email Confirmation)

Supabase email confirmation is enabled, so signup requires an OTP code confirmation step:

- Sign up (email/password)
- Confirm email (enter OTP code)
- Session becomes active and app routes into main tabs

OTP verification call:

```ts
supabase.auth.verifyOtp({ email, token, type: "signup" })
```

---

## Project Structure (high-level)

```txt
reset-app/
  App.tsx
  index.ts
  app.json
  package.json
  tsconfig.json
  assets/
  src/
    components/
      ui.tsx
      DismissKeyboard.tsx
    lib/
      supabase.ts
      db.ts
      logging.ts
      journal.ts
      profiles.ts
      community.ts
      checkin.ts
      suggestions.ts
    screens/
      HomeScreen.tsx
      LogScreen.tsx
      JournalScreen.tsx
      CommunityScreen.tsx
      ExploreScreen.tsx
      AuthScreen.tsx
      ProgressScreen.tsx
  .env.example
  .gitignore
```

---

## Data & Persistence

### Local SQLite (prototype persistence)
Stored locally via `expo-sqlite`:
- Daily logs (Log tab)
- Journal entries (Journal tab)

Key files:
- `src/lib/db.ts` — SQLite setup + table creation
- `src/lib/logging.ts` — upsert today’s log, fetch latest
- `src/lib/journal.ts` — create/list journal entries

### Supabase (auth + community)
Tables:
- `public.profiles`
- `public.community_posts`

Important constraint:
- `community_posts.author_user_id` references `profiles.user_id`
- A user can exist in `auth.users` but not yet in `public.profiles`

To prevent foreign key failures, the app ensures a profile exists (see `ensureMyProfile()` in `src/lib/profiles.ts`), and community post creation calls it before insert.

---

## Supabase Schema Expectations (summary)

`public.profiles`
- `user_id uuid` (matches `auth.users.id`)
- `username text` (optional depending on final schema)
- `display_name text`
- `created_at timestamptz`
- RLS: read/insert/update own only

`public.community_posts`
- `id uuid`
- `author_user_id uuid` → references `profiles(user_id)`
- `room text` (`general|support|advice`)
- `tags text[]`
- `body text`
- `created_at timestamptz`
- RLS:
  - authenticated can read
  - insert only when `auth.uid() = author_user_id`
  - update/delete own only

---

## Troubleshooting

Env vars not loading
- Confirm `.env` is in repo root
- Restart with cache clear:

```bash
npx expo start -c --tunnel
```

Posting fails with foreign key constraint
- User is missing a `public.profiles` row
- Ensure `ensureMyProfile()` runs on login and before creating a post

Expo Go network issues
- Use tunnel:

```bash
npx expo start --tunnel
```

---

## Contributing

- Base branch: `main`
- Feature branches: `feature/<short-description>`
- PRs should include “How to test” steps and screenshots for UI changes.

---

## Security

- Never commit `.env`
- If keys were ever pushed publicly, rotate them and confirm RLS policies are correct.
