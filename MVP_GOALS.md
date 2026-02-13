# r.e.s.e.t — MVP Goals

This document captures **MVP 2 objectives** and how they set up **MVP 3 (final pre–App Store MVP)**.

---

## MVP 2 Objectives (Build the “real product loop”)

### 1) Core daily loop is complete and reliable
- Guided daily log becomes a true **5–10 minute** experience (multi-step, progress, save/resume).
- Home shows a clear “today” state:
  - logged today or not
  - last mood snapshot
  - quick CTA to start/continue
- Basic trends (starter insights) from existing data:
  - 7-day mood/stress view
  - simple streaks

### 2) Journaling becomes more valuable (still simple)
- Journal entries support:
  - tags (user-applied + optional suggested)
  - search + filter
  - optional prompts/templates
- Lightweight reflections (safe, non-clinical):
  - “Try this next prompt”
  - “Theme recap” (user-confirmed tags)

### 3) Local → cloud sync foundation (accounts feel worth it)
- Optional backup/sync for:
  - daily logs
  - journal entries
- Clear behavior:
  - signed out = local only
  - signed in = local + cloud backup + restore on new device

### 4) Community becomes useful + safer
- Add minimal engagement:
  - reactions (like)
  - comments (optional if time; can ship after reactions)
- Safety/ops:
  - report a post
  - basic moderation hooks (even if manual review at first)
- UX polish:
  - empty/loading states
  - “My posts” view
  - clearer room/category selection

### 5) Explore becomes configurable
- Move Explore items to a config file (or remote table) so content can be updated easily.
- Track outbound clicks (basic analytics event).

### 6) Instrumentation (so you can learn)
- Analytics events:
  - signup started/completed + OTP confirmed
  - log started/completed
  - journal created
  - community post created
  - explore link clicked
- Add basic error reporting (crashes + non-fatal errors).

### 7) Design & accessibility pass
- Standardize spacing/typography/components (use `src/components/ui.tsx` consistently).
- Accessibility basics:
  - readable text sizes
  - adequate tap targets
  - color contrast checks for palette

---

## MVP 2 AI (Recommended: Lightweight + Safe)

AI in MVP 2 should be **assistive** (writing/help), not clinical.

### Include (safe, controlled)
- Prompt suggestions after log/journal (non-clinical, supportive tone)
- Optional “one-sentence” journal summary (user can edit)
- Tag/theme suggestions (user must confirm before saving)
- Optional rewrite helper (user-initiated only)

### Avoid until MVP 3 or later (higher risk)
- Any diagnosis-like language (“you might have…”)
- mental health risk scoring
- crisis detection workflows (unless you are ready for the operational burden)
- prescriptive “coaching” that reads like professional medical advice

---

## MVP 2 Definition of Done

You can hand MVP 2 to testers and answer:
- Do users complete the daily log?
- Do they return the next day (retention)?
- Does journaling add value?
- Does community feel safe/engaging?
- Can users keep/restore data across devices?

---

## MVP 3 Objectives (Final MVP before App Store)

MVP 3 is “launch readiness” and production hardening.

### 1) Compliance & trust
- Privacy policy + clear disclosures
- Data export / delete
- Account deletion path
- Community rules + moderation policy + reporting flow complete

### 2) Production robustness
- Offline mode tested (known states, graceful degradation)
- Sync conflict handling
- Performance improvements (lists, caching, load states)
- Better reliability and error handling across auth/sync

### 3) Polished UX
- Onboarding + personalization (goals, preferences)
- Notification preferences (reminders, opt-in)
- In-app help/FAQ
- Final design consistency pass

### 4) Release readiness
- Beta distribution (TestFlight/internal)
- Versioning + release notes pattern
- Basic QA checklist and smoke tests

---

## Suggested Scope Boundaries

### Not in MVP 2 (save for MVP 3 or post-launch)
- Apple Health / Apple Watch integrations
- Strava integration
- Voice journaling (unless extremely minimal)
- Full AI “coaching” / deep summarization

