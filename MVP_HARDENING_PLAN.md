# MVP Hardening Plan

Follow-up to the MVP assessment (see `TRIP_SUMMARY_PLAN.md` for the original
Where/When/Who/What tab spec). This document tracks the next round of work,
in the order we agreed to tackle it. Each phase should land as its own
commit (or small set of commits) with a pause for review before moving on.

Status legend: ⬜ not started · 🔷 in progress · ✅ done

---

## Phase 0 — Quick fixes & housekeeping

### 0.1 ✅ Fix `trips#destroy` 500
`config/routes.rb` defines `delete '/trips/:id' => 'trips#destroy'` but
`Api::V1::TripsController` had no `destroy` action. **Implemented as a
soft delete**: added `archived_at:datetime` to `trips`
(migration `20260925000001`), a `default_scope { where(archived_at: nil) }`
on `Trip` (also hides archived trips from the public share link and
`join`/`add_guest`/`update_availability`, which is the desired behavior),
plus `Trip#archive!`/`#archived?` and a `Trip.archived` scope for later
access to the history. `destroy` now calls `@trip.archive!` and returns
`204`. Verified via `rails runner` (archived trip disappears from
`Trip.exists?` and `find_by(share_token:)`, still reachable via
`Trip.archived`) and via `recognize_path` for the route itself.

**Files:** `app/controllers/api/v1/trips_controller.rb`, `app/models/trip.rb`,
`db/migrate/20260925000001_add_archived_at_to_trips.rb`

### 0.2 ⬜ Remove legacy trip-invitation code — **on hold, re-scoped**
Attempted this and had to revert it. Correction to the earlier research:
`TripInvitation` / `trip_invitations` is **not fully dead**. `AppRoot.tsx`
has a client-side route for `/dashboard` that renders
`Dashboard/Dashboard.tsx` → `Display.tsx`, which is a real, reachable
page (friends list, pending friend requests, and a "Trip Invitations"
section with an "Accept" button). That button PATCHes the legacy
`/trip_invitations` endpoint.

However, the data feeding that section (`localUser.pending_trip_invitations`)
already comes from `trip_memberships` (the new system) via
`components_controller.rb`, not from the `trip_invitations` table. Since
`TRIP_SUMMARY_PLAN.md` confirms no new rows are ever written to
`trip_invitations` anymore, that "Accept" button's PATCH request will
never find a matching legacy record — **the button is already
non-functional in production**, even though the page around it still
renders. So: the table is genuinely unused for real data, but the
model/controller/routes can't be deleted yet without also fixing this
page, or the `/dashboard` route will break/500.

Re-scoped as: rebuild/retire the `/dashboard` page (friends list +
invitations UI) as part of **Phase 4** (it's profile/social-adjacent
anyway), swapping the "Accept" button over to the `TripMembership`
accept flow already used elsewhere. *Then* remove `TripInvitation` model/
controller/routes and drop the `trip_invitations` + `trips_users` tables
as a fast follow. Not attempting a standalone removal before that.

**Files (deferred to Phase 4):** `app/javascript/components/Dashboard/*`,
`config/routes.rb`, `app/controllers/trip_invitations_controller.rb`,
`app/models/trip_invitation.rb`, `app/models/trip.rb` (drop the
`has_many :trip_invitations` line), new migration for both tables

---

## Phase 1 — Testing foundation

Do this before the bigger feature phases so that real-time sync, comments,
and privacy/visibility logic all land with test coverage from day one
instead of being backfilled. Current state: 3 model tests, 3 controller
tests (none for the `api/v1` namespace), zero frontend tests despite
Jest/RTL being fully configured (`jest.config.js`, `jest.setup.js`,
`__mocks__/`).

### 1.1 ⬜ Backend request/test scaffolding
- Add fixtures (or a factory pattern — decide `fixtures` vs. `factory_bot`;
  recommend sticking with Rails fixtures since that's already the
  convention in `test/fixtures`) for `User`, `Trip`, `TripMembership`,
  `TripGearItem`, `TripSkill`, `Friendship`.
- Add an authentication test helper that stubs `session[:userinfo]` so
  `api/v1` controller tests don't need to fake Auth0.
- Write a full request-spec suite for `Api::V1::TripsController` as the
  reference example (index/show/create/update/destroy, including the
  guest-removal and `extra_data` merge behavior we fixed earlier) —
  this becomes the template other controllers' tests copy.
- Backfill at least happy-path + one authorization-failure test for
  `trip_gear_items_controller.rb` and `trip_skills_controller.rb` (this
  is where the symbol/string key bug lived — a regression test belongs
  here specifically).

### 1.2 ⬜ Frontend component test scaffolding
- Verify the existing Jest config actually runs (`npm test` or whatever
  the `package.json` script is) against a trivial smoke test first.
- Write one solid example suite (recommend `WhatTab.tsx`'s `GearSubTab`,
  since it has the most interesting recent logic: commit quantities,
  organizer edit/remove) to serve as the pattern for future component
  tests.
- Decide on a light convention doc (a few lines in this file or a
  `test/README` — not a big separate guide) for what "enough" frontend
  coverage looks like at MVP stage: interaction/behavior tests over
  snapshot tests.

### 1.3 ⬜ Wire tests into a lightweight CI check
No CI currently exists (no `.github/workflows`). Add a minimal GitHub
Actions workflow that runs `bin/rails test` and `npm test` on push/PR.
Keep it minimal — this isn't the place to add linting/coverage
thresholds unless you want them.

**Files:** `test/fixtures/*`, `test/api/v1/*` (new), `app/javascript/**/*.test.tsx` (new),
`.github/workflows/ci.yml` (new)

---

## Phase 2 — Real-time trip sync

Addresses the "keep everyone on the same page" gap: right now two people
viewing the same trip won't see each other's changes without a manual
reload.

### 2.1 ⬜ Decide transport
Recommendation: **ActionCable**, one channel per trip
(`TripChannel`, stream identified by trip id), broadcasting a lightweight
"trip changed, re-fetch" event (or the full updated trip JSON if small
enough) on every mutation. Rationale in-thread above — reuses installed
infra, avoids tying realtime capacity to Puma's request thread pool the
way `ActionController::Live` (SSE) would. Revisit only if ActionCable
setup proves painful in practice.

### 2.2 ⬜ Backend: broadcast on mutation
Add broadcasts to the existing mutation points: `trips_controller#update`,
`trip_gear_items_controller#commit/update/destroy`,
`trip_skills_controller#volunteer`, membership add/remove, and (once built)
the comment endpoints from Phase 3. Keep this DRY — a single
`trip.broadcast_refresh!` model method (or a controller concern) called
from each action, rather than duplicating broadcast calls.

### 2.3 ⬜ Frontend: subscribe + refetch
Subscribe to the trip's channel when a trip is open (`TripPlan.tsx` or
wherever the trip is loaded), refetch on message, unsubscribe on unmount.
Add a small visual indicator (e.g. "someone else is updating this trip…")
optional — not required for MVP but cheap and nice.

### 2.4 ⬜ Tests
Channel test (subscribes correctly, broadcasts fire on mutation) using
the Phase 1 scaffolding as the pattern.

**Files:** `app/channels/trip_channel.rb` (new), mutation points in
`app/controllers/api/v1/*`, `app/models/trip.rb`, frontend trip-loading code

---

## Phase 3 — Trip comment thread

Builds on Phase 2 so new comments show up live, not just on refresh.

### 3.1 ⬜ Data model
Simple flat comment thread per trip (not per-field/per-gear-item — keep
scope tight for MVP): `TripComment belongs_to :trip, belongs_to :user`,
`body:text`, timestamps. New migration + model + test.

### 3.2 ⬜ Backend
`Api::V1::TripCommentsController` — index (paginated or just "load all,
it's a trip not a forum"), create, destroy (own comment or organizer).
Broadcast new comments via the Phase 2 channel.

### 3.3 ⬜ Frontend
New tab or section (check `TRIP_SUMMARY_PLAN.md`'s tab layout — likely
fits best as part of an existing tab or a new "Discuss" tab) with a
simple list + composer, consistent with existing tab patterns.

### 3.4 ⬜ Tests
Controller request tests + one frontend interaction test (post a
comment, see it appear).

**Files:** new migration, `app/models/trip_comment.rb`,
`app/controllers/api/v1/trip_comments_controller.rb`, `config/routes.rb`,
new frontend component

---

## Phase 4 — Profile overhaul with field-level visibility

Do this before Phase 5 (search) since search's "discoverable" toggle is
naturally one of these visibility settings, not a one-off boolean —
building the general visibility model first avoids retrofitting.

### 4.1 ⬜ Design the visibility model
Proposed three tiers per relevant profile field:
- **Public** — visible to anyone (including on a public trip share link)
- **Friends-only** — visible only to accepted friends
- **App-only** — never shown to other users, but usable by the app itself
  (e.g. address used for distance calculations, never rendered to
  another user's screen)

Needs a decision on shape: a single `profile_visibility` jsonb column on
`User` mapping field name → tier (consistent with the app's existing
jsonb-for-flexible-metadata pattern), vs. dedicated columns. Recommend
jsonb for consistency with `extra_data`/`guest_list`, but note the
symbol/string-key bug class this codebase has hit twice already — if we
go jsonb here, use string keys everywhere and add a model-level accessor
(`User#visibility_for(field)`) rather than reading the hash directly in
multiple places, precisely to avoid a third occurrence of that bug.

The "discoverable via search" setting from Phase 5 fits here as its own
boolean (`discoverable_by_search`) or as a pseudo-field in the same
visibility map — decide during implementation, but keep it in the same
settings UI regardless.

### 4.2 ⬜ Backend
Update `UsersController` (or add a `ProfilesController`) with an update
action that accepts the field values + visibility map together. Add a
serializer/`as_json` mode that filters fields by requester relationship
(self / friend / stranger) — this will also be reused by Phase 5's search
results and by anywhere else another user's profile is rendered
(`WhoTab`, friend lists, etc.). Audit existing places user profiles are
serialized/rendered to apply this filter — this is the main risk area,
since leaking a field that should've been friends-only or app-only is a
real privacy bug, not just a UX one.

### 4.3 ⬜ Frontend
New profile edit page (replacing the current one) with per-field
visibility controls — probably a simple three-way toggle next to each
field rather than a separate settings screen, so the privacy choice
stays next to the data it protects.

### 4.4 ⬜ Tests
This is the phase most worth over-testing: request tests asserting a
stranger genuinely cannot see friends-only or app-only fields via any
endpoint, not just the intended one. Add a test that specifically hits
every endpoint known to serialize a `User` and checks field leakage.

**Files:** migration for visibility storage, `app/models/user.rb`,
`app/controllers/users_controller.rb` (or new `profiles_controller.rb`),
new frontend profile page, audit of existing `as_json(include: ...)` call sites

---

## Phase 5 — Discoverable user search (by name or email)

Explicit opt-in required (`discoverable_by_search`, defaulting to
**off**) given the privacy implications the user flagged. This replaces
the current UUID-only friend-add flow's exclusivity, not the flow itself.

### 5.1 ⬜ Backend search endpoint
`GET /api/v1/users/search?q=...` matching name or email, scoped to
`discoverable_by_search: true` only, excluding the requester, excluding
users already friended/pending. Rate-limit or at least cap result count
to avoid this becoming a scraping vector for the whole user table.
Returns only the public-tier fields from Phase 4's serializer (name,
maybe avatar — never email in the response body itself, even though
email was the search key, unless the searching user already knows it).

### 5.2 ⬜ Frontend
Add a search box to `WhoTab`'s `InviteForm` alongside the existing
friends-list picker, and to wherever friend-adding currently lives
(`friendships_controller`'s consumer). Sending a friend request from
search results reuses the existing `Friendship` create flow — no new
invite mechanism needed.

### 5.3 ⬜ Tests
Confirm non-discoverable users never appear in search results, even to
someone who has their exact email. Confirm rate/count limits work.

**Files:** `app/controllers/api/v1/users_controller.rb` (new search action
or new `Api::V1::UserSearchController`), `config/routes.rb`, `WhoTab.tsx`

---

## Explicitly deferred (not in this plan)

- Notifications (email/push) — revisit once Phases 2–3 give it something
  real to notify about, per earlier discussion.
- Monetization features (accommodations, ride-sharing, rentals) — after
  an existing user base, per earlier discussion.
- Co-organizer role, trip templates, personal packing checklist, weather
  gear nudges, ICS export, post-trip archive/debrief — good ideas from
  the assessment, not blocking, not scheduled yet.

---

## Working agreement

- One phase (or sub-phase, for the bigger ones) per commit, paused for
  review before starting the next.
- Update the status checkboxes in this file as we go so it stays an
  accurate log, not just a plan.
