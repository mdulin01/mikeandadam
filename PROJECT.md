# MikeandAdam

## Overview
Personal life management app for Mike & Adam. Covers travel planning, fitness tracking, event hosting with guest invitations, memories/photos, and a shared hub for tasks, lists, and ideas.

- **Domain**: mikeandadam.app
- **GitHub**: github.com/mdulin01/mikeandadam (branch: master)
- **Vercel Project**: mikeandadam
- **Firebase Project**: MikeandAdam (ID: trip-planner-5cc84)
- **Firebase Storage**: trip-planner-5cc84.firebasestorage.app

## Tech Stack
React 18 + Vite + Tailwind CSS, Firebase Auth (Google), Firestore, Firebase Storage, React Router, heic2any for photo conversion. Deployed on Vercel with SPA rewrites.

## Architecture
Monolithic single-page app. Main component is `src/trip-planner.jsx` (12,100+ lines) which orchestrates all sections. Custom hooks (`useTravel`, `useFitness`, `useSharedHub`) handle data. Shared components in `src/components/`. Guest-facing event page at `src/components/GuestEventPage.jsx` uses its own Firebase connection (no auth required).

### Key Sections
- **Home**: Hero carousel, stats, navigation
- **Travel**: Trips, wishlist, flights, reservations, packing, budget
- **Fitness**: Training plans, workout tracking (Indy Half, Triathlon)
- **Events**: Party events, guest invitations (unique token links), RSVP, collaborative lists, photo gallery
- **Memories**: Timeline, category views, photo uploads
- **Shared Hub**: Tasks, lists, ideas, habits (shared context)
- **Calendar**: Google Calendar integration

### Data Model
Firestore collections: `tripData/` (main doc with all data), `events/{eventId}` (individual event docs for guest access). Dual-write pattern keeps both in sync.

### Routes
- `/` - Home
- `/travel`, `/fitness`, `/events`, `/memories` - Main sections
- `/event/:eventId?t=TOKEN` - Public guest event page (no auth)

## Remaining Work

### High Priority
- [ ] Guest event page: test full RSVP flow end-to-end after Submit button change
- [ ] Fitness week photos upload not working (see ENHANCEMENTS.md)
- [ ] Deploy Firebase Cloud Functions for HTML email invitations (currently using Gmail compose URL as workaround)

### Medium Priority
- [ ] Nutrition section (placeholder only)
- [ ] Service worker for offline access
- [ ] Push notifications (workout reminders, trip countdowns)

### Lower Priority
- [ ] Life Planning section
- [ ] Business section
- [ ] iOS/Android widgets
- [ ] Data export (JSON/PDF backup)
- [ ] Refactor trip-planner.jsx into smaller modules (12k+ lines)

## Git Quick Reference
```bash
cd mikeandadam
npm run dev      # Dev server (localhost:5173)
npm run build    # Production build to dist/
git push         # Push to GitHub (auto-deploys via Vercel)
```
