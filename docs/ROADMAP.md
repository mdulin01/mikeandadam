# Mike & Adam's Adventures — Roadmap

*Last updated: July 5, 2026 (post 3-phase overhaul)*

## Purpose
Help Mike + Adam achieve joint goals, coordinate their lives, and replace
social media with a private place to save + share memories.

## Current state (2026-07-05)

| Area | Status |
|------|--------|
| Hub (default view) | ✅ TodayCard ("today together") + goals/tasks/lists/ideas/habits |
| Fitness | ✅ GSO Half plan (16wk, from Mike's sheet); Indy archived; tri/Cary removed |
| Events | ✅ Party events + travel (trips mirror one-way from mikestravel) |
| Memories | ✅ NEW feed view (default): big photos, reactions, comments, "this week in your story" lookback; timeline/events/media views kept |
| Notifications | ✅ Data-only FCM. Daily coupleDigest 7:30am ET, memoryPrompt 10am, biweekly nudge, instant triggers (task assigned/completed, training checked off), notifyPrefs + quiet hours 22–07 |
| Rupert | ✅ Banner (rupert/coupleNote, written by mikeslife cron-couple-context 10:51 UTC); coupleContext slice feeds morning brief + Rupert chat; "Ask Rupert to plan" on ideas (Mike) |
| Data model | ✅ memories + tasks in subcollections (per-doc diff-sync; legacy arrays = fallback until rules deploy) |
| Rules | ✅ tightened (guests limited to RSVP/collab fields) — NEEDS DEPLOY |
| Dead sections | ✅ Nutrition/Life Planning/Business removed (live in mikesnutrition/mikeslife/mikes-money) |

## Manual deploys still required (Mike, from repo root)
```
firebase deploy --only firestore:rules
firebase deploy --only functions        # then confirm deletion of weeklySummary/testSummary
```
Until rules deploy: subcollection writes fail silently and the app falls
back to legacy array writes (no data loss, no new features active).

## Backlog (deliberate deferrals)
1. **Finish the component split** (docs/REFACTORING_GUIDE.md): extract
   Fitness/Events/Memories/Hub section JSX out of trip-planner.jsx
   (~12.4k lines). Do interactively with browser verification, one
   section per session.
2. Notification prefs UI (functions already respect tripData/notifyPrefs).
3. Fitness week photo upload bug (docs/ENHANCEMENTS.md) — needs runtime debugging.
4. Legacy cleanup after migration verified: remove memories/tasks arrays
   from tripData docs + the fallback code paths.
5. Shared albums per trip/event; Adam-facing Rupert (couple chat) — future.
