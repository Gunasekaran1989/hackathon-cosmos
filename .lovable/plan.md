# Plan: Separate public "Past Hackathons" section

## Goal
Keep expired hackathons publicly accessible on their own page while removing them from the main active/upcoming listing. Do not auto-change their `status`; use the existing `end_date` column to split active and past events.

## What will change

### 1. New route
Add `/hackathons/past` in `src/App.tsx`.

### 2. Active listing (`/hackathons`)
- Filter query to `status = 'approved'` AND (`end_date IS NULL` OR `end_date >= current_date`).
- Keep ordering by `start_date ASC`.
- Add a link to the new "Past hackathons" page.

### 3. Past listing page (`src/pages/PastHackathons.tsx`)
- New page using the same layout/card style as `/hackathons`.
- Query `status = 'approved'` AND `end_date < current_date`, ordered by `start_date DESC` (most recent first).
- Add a link back to active hackathons.
- Show an empty state when no past events exist.

### 4. Detail page (`/hackathon/:id`)
- Compute `isPast` from `end_date`.
- Show a "Past Event" / "Ended" badge.
- Disable the "Register Now" button and replace the tracking CTA with read-only copy when the event is past.
- Keep the page publicly accessible (still `status = 'approved'`).

### 5. Reusable card (optional but recommended)
Extract the inline card from `src/pages/Hackathons.tsx` into a small component so both active and past pages share the same markup/styling.

### 6. MCP tool (`list_hackathons`)
Add an `include_past` boolean option that defaults to `false`, so agent queries return active events unless explicitly asked for history.

### 7. Verification
Run typecheck and production build after all changes.

## Out of scope (unless you ask)
- Changing the homepage static sample data (`src/data/hackathons.ts`) — it is not connected to the database.
- Auto-updating `status` to `archived` — we will leave `status = 'approved'` and filter by date instead.
- Admin workflow changes — admin pages already support `archived` status manually.

## Files expected to change
- `src/App.tsx`
- `src/pages/Hackathons.tsx`
- `src/pages/HackathonDetail.tsx`
- `src/pages/PastHackathons.tsx` (new)
- `src/lib/mcp/tools/list-hackathons.ts`
- Possibly a new shared card component under `src/components/`
