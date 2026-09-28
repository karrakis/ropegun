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
accept flow already used elsewhere. _Then_ remove `TripInvitation` model/
controller/routes and drop the `trip_invitations` + `trips_users` tables
as a fast follow. Not attempting a standalone removal before that.

**Files (deferred to Phase 4):** `app/javascript/components/Dashboard/*`,
`config/routes.rb`, `app/controllers/trip_invitations_controller.rb`,
`app/models/trip_invitation.rb`, `app/models/trip.rb` (drop the
`has_many :trip_invitations` line), new migration for both tables

**Update:** the `/dashboard` rebuild landed in 4.5 — the "Accept" button
now uses the real `TripMembership` flow. The legacy `TripInvitation`
model/controller/routes/tables removal described above is still not done
and remains the fast-follow to pick up next.

---

## Phase 1 — Testing foundation

Do this before the bigger feature phases so that real-time sync, comments,
and privacy/visibility logic all land with test coverage from day one
instead of being backfilled. Current state: 3 model tests, 3 controller
tests (none for the `api/v1` namespace), zero frontend tests despite
Jest/RTL being fully configured (`jest.config.js`, `jest.setup.js`,
`__mocks__/`).

### 1.1 ✅ Backend request/test scaffolding

Also had to fix three pre-existing test-infrastructure blockers before any
of this could run at all: a fixture (`user_linked_locations.yml`) for a
table dropped in a past migration (deleted, along with the orphaned
model/test); `users.yml` referencing columns removed from the `users`
table (rewritten); and the local Postgres role lacking superuser, which
broke both Rails' `verify_foreign_keys_for_fixtures` safety check (disabled
via `config/environments/test.rb`) and fixture bulk-insert's ability to
disable referential-integrity triggers for out-of-order inserts (fixed at
the DB level via migration `20260925000003`, marking all FKs
`DEFERRABLE INITIALLY DEFERRED`).

- Added fixtures for `User`, `Trip`, `TripMembership`, `Skill`,
  `GearItem`, `TripSkill`, `TripGearItem`, `Friendship`.
- Added `sign_in_as(user)` to `ActiveSupport::TestCase`
  (`test/test_helper.rb`), stubbing `session[:userinfo]` so `api/v1`
  controller tests don't need to fake Auth0.
- Wrote a full request-spec suite for `Api::V1::TripsController`
  (`test/controllers/api/v1/trips_controller_test.rb`) as the reference
  example (index/show/create/update/destroy, including the
  guest-removal and `extra_data` merge behavior, plus ownership scoping
  and the soft-delete/archive behavior from Phase 0.1) — this is the
  template other `api/v1` controllers' tests copy.
- Backfilled happy-path + authorization-failure tests for
  `trip_gear_items_controller.rb` and `trip_skills_controller.rb`
  (`test/controllers/api/v1/trip_gear_items_controller_test.rb`,
  `trip_skills_controller_test.rb`), including regression tests
  specifically for the `commitments`/`committed_quantity` and
  `volunteers` jsonb string-key behavior (this is where the
  symbol/string key bug lived previously).
- Full suite (`bin/rails test`) passes with only the same 7 pre-existing,
  unrelated failures (`FeedbacksControllerTest`, one
  `LocationsControllerTest` case) that existed before this phase — no
  regressions introduced.

**Files:** `test/fixtures/{users,trips,trip_memberships,skills,gear_items,
trip_skills,trip_gear_items,friendships}.yml`, `test/test_helper.rb`,
`test/controllers/api/v1/{trips,trip_gear_items,trip_skills}_controller_test.rb`,
`config/environments/test.rb`,
`db/migrate/20260925000003_make_foreign_keys_deferrable.rb`

### 1.2 ✅ Frontend component test scaffolding

Correction to this section's original premise: the codebase already had
4 passing Jest suites (`AppRoot.test.jsx`, three `Weather/*.test.jsx`
files) — not zero. Confirmed the config runs cleanly (`npx jest`, all
existing suites green) before adding anything new.

- Added `WhatTab.test.tsx` as the reference example, covering
  `GearSubTab` (the sub-component with the most interesting recent
  logic — commit quantities, organizer add/remove) by rendering the
  exported `WhatTab` (defaults to the "gear" sub-tab on mount, since
  `GearSubTab` itself isn't exported directly). Covers: empty state,
  rendering needed/committed counts and existing commitments,
  organizer-only controls being hidden from non-organizers, committing
  to an item (POST with the right body, `onTripUpdated` called with the
  response), and organizer item removal (DELETE). `fetch` is mocked
  per-URL rather than globally stubbed once, since the component fires
  a catalogue fetch on mount plus a distinct fetch per interaction.
- Convention for "enough" frontend coverage at MVP stage (light,
  in-line rather than a separate doc): prefer interaction/behavior tests
  via Testing Library (`render` + `userEvent` + `screen` queries) over
  snapshot tests; assert on user-visible text/roles and on the
  `fetch` calls a component makes, not on internal state or markup
  structure; one reference suite per meaningfully-complex component is
  enough for now — don't chase full coverage before Phase 2+ features
  land.
- Full suite (`npx jest`) passes: 5 suites, 12 tests, no regressions.

**Files:** `app/javascript/components/TripPlan/Tabs/WhatTab.test.tsx`

### 1.3 ✅ Wire tests into a lightweight CI check

Added `.github/workflows/ci.yml` with two jobs, both running on every
push/PR:

- **backend**: spins up a `postgres:16` service container with the same
  `ropegun`/`gargoyle` role and `ropegun_test` database that
  `config/database.yml` hardcodes (so no code/config changes needed for
  CI), loads the schema via `bin/rails db:schema:load`, then runs
  `bin/rails test`. Pins `ruby-version: 3.2.3` explicitly for
  `ruby/setup-ruby`, since the repo's `.ruby-version` (3.0.3) is stale
  relative to the Gemfile's pinned `3.2.3`.
- **frontend**: `actions/setup-node@v4` (Node 22, matching local dev),
  `yarn install --immutable`, then `yarn test` (i.e. `jest`).

Kept intentionally minimal per the plan — no linting or coverage
thresholds added. Verified locally that `bin/rails db:schema:load
RAILS_ENV=test` followed by `bin/rails test` reproduces the same 7
pre-existing (unrelated) failures and no new ones, matching what CI
should report.

**Files:** `.github/workflows/ci.yml`

---

## Phase 1 wrap-up

Phase 1 (testing foundation) is complete: backend fixtures/helpers/reference
suites (1.1), a frontend reference suite + coverage convention (1.2), and a
CI workflow running both on every push/PR (1.3). 34 backend tests + 12
frontend tests passing, plus the 7 pre-existing unrelated failures now
visible (not newly introduced) instead of the test suite being 100% blocked
by environment issues as it was at the start of this phase.

---

## Phase 2 — Real-time trip sync

Addresses the "keep everyone on the same page" gap: right now two people
viewing the same trip won't see each other's changes without a manual
reload.

### 2.1 ✅ Decide transport

Went with **ActionCable** as recommended: one channel per trip
(`TripChannel`, stream identified by the `Trip` record itself via
`stream_for`/`broadcast_to`), broadcasting the full updated trip JSON on
every mutation (small enough payload — same shape as the `show` endpoint
— so the frontend can apply it directly without an extra round-trip).
Auth reuses the existing session-cookie approach: `ApplicationCable::Connection`
now identifies the connection by looking up `request.session[:userinfo]`,
the same way `ApplicationController#current_user` does for HTTP requests,
so no separate cable-specific auth token was needed. `TripChannel#subscribed`
rejects unless the connecting user has a `TripMembership` on the trip
(owners get one automatically via `Trip#ensure_owner_membership`).

### 2.2 ✅ Backend: broadcast on mutation

Added `Trip#broadcast_refresh!` (reloads the record, broadcasts
`as_json(include: Trip::BROADCAST_INCLUDE)` to its channel stream) and
called it from every mutating action across the relevant controllers,
which ended up being a bit broader than this section's original bullet
list (that list omitted `trip_gear_items#create`, `trip_skills#create`,
and `trip_skills#unvolunteer`, which looked like an oversight given the
stated goal of "everyone stays in sync" — left out, those actions
wouldn't show up live either):

- `Api::V1::TripsController#update`
- `Api::V1::TripGearItemsController#create/commit/update/destroy`
- `Api::V1::TripSkillsController#create/volunteer/unvolunteer`
- `Api::V1::TripMembershipsController#create/update/destroy`

`trips_controller#destroy` (archive) was deliberately left out — out of
scope for this pass, revisit if archiving a trip out from under active
viewers turns out to matter in practice.

Also caught and fixed a gap in the same spirit: the share-link self-join
and anonymous-guest flows (`TripsController#join` and `#add_guest`, the
server-rendered `public_show` page — a separate code path from the SPA's
invite/accept flow above) weren't broadcasting at all, so an organizer
with a trip open in the SPA wouldn't see someone join via the share link
or add themselves as a guest without a manual reload. Added
`@trip.broadcast_refresh!` to both, only on the branch where a new
membership/guest is actually created (not on the idempotent no-op path).

### 2.3 ✅ Frontend: subscribe + refetch

`TripPlan.tsx` (where the open trip already lives in state) subscribes
to `TripChannel` for the current `tripId` whenever the "created" screen
is showing, and unsubscribes on unmount/trip change. Deviated slightly
from "refetch on message": since the broadcast payload is already the
full trip JSON in the same shape the initial `show` fetch uses, the
handler applies it directly via `setCreatedTrip(data)` instead of
triggering a second network round-trip — same end result, one less
request. Added `app/javascript/utilities/cable.ts` (lazy shared
`Consumer` via `createConsumer()`) and a minimal ambient module
declaration for `@rails/actioncable` in `custom.d.ts` (the package ships
no TypeScript types; not worth adding a `@types/` package for two
functions' worth of surface area). Skipped the optional "someone else is
updating this trip…" indicator — cheap but not required for MVP, not
added.

### 2.4 ✅ Tests

Added `test/channels/trip_channel_test.rb` (`ActionCable::Channel::TestCase`):
confirms a trip member subscribes and streams for the trip, rejects a
non-member, rejects subscribing to a nonexistent trip, and confirms
`Trip#broadcast_refresh!` broadcasts exactly once to the trip's stream.
Didn't add a frontend test for the `TripPlan.tsx` subscription wiring
itself — exercising it meaningfully would mean rendering through
`TripSummary`'s full tab tree (including the Google-Maps-backed
`WhereTab`), which is disproportionate for what's a few lines of
subscribe/unsubscribe glue; relying on the channel test above plus
`tsc --noEmit` staying clean for that file.

Also added `test/controllers/trips_controller_test.rb` (4 tests) for the
`join`/`add_guest` broadcast fix above: broadcasts once on a genuinely
new join, no broadcast when already a member, broadcasts once on a new
guest name, no broadcast for a duplicate guest name.

Full suite (`bin/rails test`): 40 runs (32 existing + 4 channel tests +
4 new `TripsController` tests), same 7 pre-existing unrelated failures,
no new ones. Frontend (`npx jest`): unchanged, 5 suites / 12 tests
passing.

**Files:** `app/channels/trip_channel.rb` (new),
`app/channels/application_cable/connection.rb`,
`test/channels/trip_channel_test.rb` (new), `config/routes.rb` (mounted
`ActionCable.server`), `app/models/trip.rb` (`broadcast_refresh!`),
`app/controllers/api/v1/{trips,trip_gear_items,trip_skills,trip_memberships}_controller.rb`,
`app/javascript/utilities/cable.ts` (new),
`app/javascript/components/TripPlan/TripPlan.tsx`, `custom.d.ts`,
`package.json`/`yarn.lock` (added `@rails/actioncable` as a direct
dependency — it was already present transitively via
`@hotwired/turbo-rails`, but we import it directly now)

---

## Phase 3 — Trip comment thread

Builds on Phase 2 so new comments show up live, not just on refresh.

### 3.1 ✅ Data model

`TripComment belongs_to :trip, belongs_to :user`, `body:text` (required),
timestamps, per the plan. Migration
(`db/migrate/20260928000001_create_trip_comments.rb`) uses
`foreign_key: { deferrable: :deferred }` inline on `t.references` —
turned out this option is silently ignored by that shorthand (confirmed
via `schema.rb` showing plain, non-deferrable FKs after running it), so
a follow-up migration
(`20260928000002_make_trip_comments_foreign_keys_deferrable.rb`)
re-applies it the same explicit `remove_foreign_key`/`add_foreign_key
..., deferrable: :deferred` way the original
`MakeForeignKeysDeferrable` migration does. Worth remembering for any
future migration that creates a table needing this.

### 3.2 ✅ Backend

`Api::V1::TripCommentsController#create/destroy`. `create` uses
`current_local_user.trips.find` (any trip member, not just the
organizer — the plan's "own comment or organizer" destroy rule implies
posting itself isn't organizer-gated). `destroy` allows the comment's
author or the trip's owner. No separate `index` action — comments ride
along as part of the trip payload itself (`{ trip_comments: { include:
:user } }` added to `Trip::BROADCAST_INCLUDE` and every controller's
duplicated `trip_include` shape), same approach already used for
skills/gear rather than a dedicated paginated endpoint — simpler, and
matches the plan's "load all, it's a trip not a forum" alternative.
Broadcasts via the existing `trip.broadcast_refresh!` from Phase 2, so
new/removed comments show up live with no extra channel work needed.

### 3.3 ✅ Frontend

New "Discuss" tab (`DiscussTab.tsx`) added to `TripSummary.tsx`'s tab
bar, after What. Simple oldest-first comment list + a composer
textarea, consistent with the existing tab visual patterns (`WhatTab`/
`WhoTab`). Each comment shows a Remove control to its author or the
organizer, calling `DELETE /api/v1/trip_comments/:id`. `TRIP_SUMMARY_PLAN.md`
lists a trip "forum" as out of scope for MVP, but `MVP_HARDENING_PLAN.md`
explicitly calls for this simple flat thread — treated the hardening
plan as authoritative here since it's the actively-tracked doc, and kept
scope deliberately minimal (no threading/replies/reactions) to match
the "keep it tight" instruction in 3.1.

### 3.4 ✅ Tests

Backend: `test/models/trip_comment_test.rb` (validation, associations)
and `test/controllers/api/v1/trip_comments_controller_test.rb` (7
tests: create for any member, scoped to membership, rejects blank body,
broadcasts on create, destroy by author, destroy by organizer, destroy
forbidden for an unrelated member). Frontend:
`DiscussTab.test.tsx` (7 tests: empty state, oldest-first ordering,
posting applies the returned trip, Post button disabled without real
content, author can remove their own comment, non-author/non-organizer
sees no Remove control, organizer sees Remove on any comment) — unlike
the Phase 2.4 decision to skip a `TripPlan.tsx`-level test, this tab is
cheap to test in isolation the same way `WhatTab.test.tsx` already is,
so a full interaction test was added rather than skipped.

Full suite (`bin/rails test`): 49 runs (40 existing + 9 new), same 7
pre-existing unrelated failures, no new ones. Frontend (`npx jest`): 6
suites / 19 tests, all passing. `tsc --noEmit`: zero errors in any
non-test file touched by this phase (the jest-globals noise in
`*.test.tsx` files is pre-existing and unrelated — `tsc` isn't
configured with Jest's type globals, but Jest itself runs these files
fine via its own transform).

**Files:** `db/migrate/20260928000001_create_trip_comments.rb` (new),
`db/migrate/20260928000002_make_trip_comments_foreign_keys_deferrable.rb`
(new), `app/models/trip_comment.rb` (new), `app/models/trip.rb`
(association + `BROADCAST_INCLUDE`), `config/routes.rb`,
`app/controllers/api/v1/trip_comments_controller.rb` (new),
`app/controllers/api/v1/{trips,trip_skills,trip_gear_items}_controller.rb`
(`trip_include` updated), `test/fixtures/trip_comments.yml` (new),
`test/models/trip_comment_test.rb` (new),
`test/controllers/api/v1/trip_comments_controller_test.rb` (new),
`app/javascript/components/TripPlan/Tabs/DiscussTab.tsx` (new),
`app/javascript/components/TripPlan/Tabs/DiscussTab.test.tsx` (new),
`app/javascript/components/TripPlan/TripSummary.tsx`

---

## Phase 4 — Profile overhaul with field-level visibility

Do this before Phase 5 (search) since search's "discoverable" toggle is
naturally one of these visibility settings, not a one-off boolean —
building the general visibility model first avoids retrofitting.

### 4.1 ✅ Design the visibility model

Three tiers per relevant profile field, matching the original proposal:

- **Public** — visible to anyone
- **Friends-only** — visible only to accepted friends (and, in one
  specific context described in 4.2, to fellow trip members)
- **App-only** — never shown to other users, but usable by the app
  itself (e.g. `home_address` for distance calculations)

Went with a `profile_visibility` jsonb column on `User` (default `{}`),
consistent with the existing `extra_data`/`guest_list` jsonb pattern.
Given the symbol/string-key bug this codebase has hit twice before, the
column has a custom `profile_visibility=` writer that sanitizes on
assignment — unknown field names and invalid tiers are silently
dropped, and everything is normalized to string keys/values before it
ever reaches the database. Nothing reads the hash directly anywhere;
`User#visibility_for(field)` is the only accessor, falling back to
`User::DEFAULT_VISIBILITY` when a field hasn't been explicitly set:

```ruby
PROFILE_FIELDS = %w[email about_me additional_information home_address].freeze
DEFAULT_VISIBILITY = {
  "email" => "friends",             # matches existing friend-list behavior
  "about_me" => "public",           # bio field, useful for a partner-finding app
  "additional_information" => "friends",
  "home_address" => "app_only"      # matches the existing "never shown" comment
}.freeze
```

`name` is intentionally excluded from `PROFILE_FIELDS` — it's always
public, no toggle needed. The `discoverable_by_search` setting from
Phase 5 was deliberately left out of this column; it isn't a
visibility _tier_ for an existing field, it's a separate opt-in
boolean, and conflating the two would complicate `visibility_for`'s
fallback logic for no real benefit. It can still live in the same
settings UI when Phase 5 lands.

### 4.2 ✅ Backend

**The real bug this phase fixes:** `UsersController#update` had no
authorization check at all (`@user = User.find(params[:id])` — any
signed-in user could edit _any_ user's profile by guessing an id), and
permitted/coerced columns (`:top_rope_belay`, `:lead_belay`,
`:tr_indoor_climb_grade`, etc.) that no longer exist on `users` (removed
by the skills-catalogue migration, replaced by `user_skills`) — meaning
the endpoint would raise `ActiveRecord::UnknownAttributeError` the
moment it was actually exercised. Both are fixed: `UsersController` now
loads `current_user` directly (ignoring `params[:id]` for anything but
a match check, returning 401/403 otherwise) and only permits real
columns (`name`, `email`, `about_me`, `additional_information`,
`home_address`, `profile_visibility`).

**Serializer**, added to `User` and reused everywhere else:

```ruby
def profile_json(as: :public)
  # as: :self   -> everything, plus the raw profile_visibility map
  # as: :friend -> "public" + "friends" tier fields, never "app_only"
  # as: :public -> "public" tier fields only (default)
end
```

`User#friends_with?(other)` is a new helper (checked no equivalent
existed) backing the `:friend` decision for a real one-on-one viewer, in
the new `GET /api/v1/users/:id` profile endpoint (`Api::V1::UsersController#show`,
looked up by `uuid`).

**Trip-membership leak audit** — this was the biggest concrete risk
found: `Trip::BROADCAST_INCLUDE` (and every controller's duplicated
`trip_include` shape) embedded `owner`/`trip_memberships.user`/
`trip_comments.user` as raw, unfiltered `User` records, meaning every
trip member's email/bio/address was sent to every other member and
broadcast over ActionCable regardless of friendship. Fixed by giving
`Trip` a single `serialize_for` method — replacing every
`trip.as_json(include: trip_include)` call site (and the now-redundant
duplicated `trip_include` private methods, deleted) — that builds the
existing include shape and then swaps in each embedded user's
`profile_json(as: :friend)` instead of the raw record:

```ruby
def serialize_for
  data = as_json(include: self.class::BROADCAST_INCLUDE)
  users_by_id = ([owner] + trip_memberships.map(&:user) + trip_comments.map(&:user))
                .compact.uniq(&:id).index_by(&:id)
  # ...replace data["owner"], each trip_membership's "user", each
  # trip_comment's "user" with users_by_id[id].profile_json(as: :friend)
end
```

Being on a trip together is treated as **friend-level trust for that
trip's data only** — a deliberate, simple product decision (not a
per-viewer one) rather than attempting per-connection ActionCable
filtering, which the single-payload `broadcast_to` API doesn't support
anyway. This keeps `WhoTab`'s existing "show tripmate email" behavior
working (email defaults to `"friends"` tier) while guaranteeing
`app_only` fields (home address) never leak to a tripmate regardless of
actual friendship status — a strictly safer default than before, where
there was no filtering at all.

### 4.3 ✅ Frontend

Replaced the broken half of the Dashboard profile pages — `Display.tsx`
and `Edit.tsx` both referenced climbing-grade columns
(`top_rope_belay`, `tr_indoor_climb_grade`, `multipitch`, etc.) removed
from the schema in an earlier migration; `Edit.tsx`'s save button would
have raised `ActiveRecord::UnknownAttributeError` the first time anyone
used it. Replaced that dead grid with real fields (`about_me`,
`additional_information`, `home_address`, plus a read-only display of
`email`), each paired with a `VisibilityToggle` (`Dashboard/Wrappers/VisibilityToggle.tsx`)
— a plain three-way `<select>` (Public / Friends only / Only me) right
next to the field it protects, per the original plan's own suggestion.
Defaults for an unset field are shared with the backend via
`app/javascript/utilities/profileVisibility.ts` (mirrors
`User::DEFAULT_VISIBILITY` — manually kept in sync, documented in a
comment). `Edit.tsx` PATCHes `/users/:id` with the edited fields plus
the full `profile_visibility` map; `Display.tsx`'s self-view just shows
the current values (no toggles needed there, since a user always sees
their own full profile). The friends-list/trip-invitations sections
were left untouched — out of scope for this phase.

### 4.4 ✅ Tests

Backend: `test/models/user_test.rb` (10 tests — `visibility_for`
defaults/overrides, `profile_visibility=` sanitization including
symbol-key normalization, `friends_with?` both directions, `profile_json`
at all three `as:` levels), `test/models/trip_test.rb` (5 tests —
`serialize_for` treats co-membership as friend-tier, never exposes
`home_address` or the raw `profile_visibility` map for _any_ embedded
user, filters the comment-author embed the same way, and respects a
member who explicitly locks a normally-friends-tier field down further),
`test/controllers/users_controller_test.rb` (5 tests — signed-out
rejected, cannot update another user's record, real fields persist,
`profile_visibility` sanitized on write, response is the filtered
`profile_json` not a raw dump), `test/controllers/api/v1/users_controller_test.rb`
(4 tests — self/friend/stranger see progressively less, confirming the
core "does the tier system actually keep a stranger out" property this
phase exists for).

Frontend: `Dashboard/Edit.test.tsx` (2 tests — visibility selects default
correctly when unset, saving PATCHes both edited field values and the
updated visibility map, and closes edit mode).

Full suite (`bin/rails test`): 73 runs (49 existing + 24 new — 10 model +
5 model(trip) + 5 + 4 controller), same 7 pre-existing unrelated
failures, no new ones. Frontend (`npx jest`): 7 suites / 21 tests, all
passing. `tsc --noEmit`: 220 errors after this phase vs. 235 before —
net _fewer_ errors (removing the dead climbing-grade code removed more
implicit-`any`/prop-typing noise than the new files added), and no new
errors were introduced by anything touched in this phase specifically
(remaining errors are the same pre-existing `React.FC<Props>`-misused-
as-destructuring-type / implicit-`any` pattern already present
throughout the codebase, e.g. `UserInfoItem`/`SectionWrapper`/
`AverageDistances.tsx`, untouched by this phase).

**Files:** `db/migrate/20260928000003_add_profile_visibility_to_users.rb`
(new), `app/models/user.rb` (`PROFILE_FIELDS`, `DEFAULT_VISIBILITY`,
`profile_visibility=`, `visibility_for`, `friends_with?`, `profile_json`),
`app/models/trip.rb` (`serialize_for`, `broadcast_refresh!` updated),
`app/controllers/users_controller.rb` (rewritten — auth fix + real
columns), `app/controllers/api/v1/users_controller.rb` (new — profile
show endpoint), `app/controllers/api/v1/{trips,trip_skills,trip_gear_items,trip_memberships,trip_comments}_controller.rb`
(all switched to `trip.serialize_for`, duplicated `trip_include`
helpers deleted), `config/routes.rb`, `test/models/user_test.rb`,
`test/models/trip_test.rb` (new), `test/controllers/users_controller_test.rb`
(new), `test/controllers/api/v1/users_controller_test.rb` (new),
`app/javascript/components/Dashboard/{Display,Edit}.tsx`,
`app/javascript/components/Dashboard/Wrappers/VisibilityToggle.tsx` (new),
`app/javascript/utilities/profileVisibility.ts` (new),
`app/javascript/components/Dashboard/Edit.test.tsx` (new)

### 4.5 ✅ Dashboard rebuild (friends list + trip invitations, ground-up)

Phase 4.3 deliberately left the friends-list/trip-invitations half of
the Dashboard page untouched ("out of scope for this phase"), and 0.2
deferred the actual `/dashboard` page rebuild to land here. Prompted by
a direct report that the profile page's Save button "doesn't even
work" — root cause: `Edit.tsx`'s `updateUser` never checked `res.ok`,
so a failed save silently merged an error payload into local state, and
the Save button called `setEditing(false)` synchronously, flipping back
to Display mode _before_ the async fetch even resolved. Rather than
patch that one handler, rebuilt the whole page per the user's explicit
request to not preserve the existing structure.

**Frontend**, replacing `Display.tsx`/`Edit.tsx`/`Dashboard.tsx` and the
now-orphaned `Wrappers/{UserInfoItem,SectionWrapper}.tsx` (deleted —
confirmed via grep to have no other consumers) with two focused
components composed by a much thinner `Dashboard.tsx`:

- `ProfileForm.tsx` — single always-editable form, no more Display/Edit
  toggle. Fixes the Save bug directly: checks `res.ok`, only calls
  `onSaved` (which updates local state) on success, shows a visible
  error message otherwise, and only flips to a "Saved." state after the
  fetch actually resolves. Reuses `VisibilityToggle` and
  `profileVisibility.ts` unchanged. Also dropped the dead "Linked
  Locations" section from the old `Display.tsx` — `User` has no
  `locations` association, so it never rendered anything real.
- `FriendsPanel.tsx` — friend invites (send/accept/reject/cancel) and
  trip invitations. The old code's trip-invitation "Accept" button
  PATCHed the legacy, permanently-broken `/trip_invitations` endpoint
  (see 0.2); it now uses the real `TripMembership` flow instead —
  `PATCH /api/v1/trip_memberships/:id` with `{trip_membership: {action:
"accept"}}` to accept, `DELETE /api/v1/trip_memberships/:id` to
  decline — both endpoints already existed and needed no backend
  changes. Also fixed: the old component's friend/invite lists were
  never actually wired to component state (actions fired a fetch and
  `console.log`'d the response, nothing more) — every list here now
  updates optimistically on a successful response.

**Backend**, two bugs found in `components_controller.rb` while wiring
the above up, both fixed:

1. **Crash**: `pending_trip_invitations` called
   `as_json(include: [:issuer, :trip])` on `TripMembership` records, but
   `TripMembership` has no `:issuer` association (that only exists on
   the legacy `TripInvitation` model) — this raised
   `ActiveRecord::AssociationNotFoundError` for any user with a real
   pending invite, crashing the whole SPA page load. Rebuilt by hand as
   `{id:, trip: {id:, name:}, issuer: membership.trip.owner.profile_json(as: :friend)}`
   — the trip owner is the de facto issuer (only owners create
   `trip_memberships`), embedded through the same `profile_json`
   filtering used everywhere else rather than a raw record dump.
2. **Visibility bypass**: the `friendships:` list serialization
   hand-built `{uuid:, email:, name:}` for each friend, unconditionally
   including email regardless of that friend's own Phase 4 visibility
   choice. Replaced with `friend.profile_json(as: :friend)`, so a
   friend who has explicitly hidden their email even from friends now
   has that respected here too.

**Tests:** `test/controllers/components_controller_test.rb` (+2 —
a pending trip invitation no longer crashes `index` and the issuer is
embedded via `profile_json` with no `app_only` fields present; a
friend's `app_only` email override is respected in the `friendships`
list instead of always leaking), `ProfileForm.test.tsx` (new — 4 tests:
visibility defaults, a successful save PATCHes the edited fields and
calls `onSaved`, a failed save shows an error and does not call
`onSaved`, a network failure shows an error), `FriendsPanel.test.tsx`
(new — 4 tests: empty states, sending an invite, accepting an incoming
friend invite, accepting a trip invitation via the new
`TripMembership` endpoint). `Edit.test.tsx` deleted along with `Edit.tsx`.

Full suite (`bin/rails test`): 75 runs, same 7 pre-existing unrelated
failures (`LocationsControllerTest`, `FeedbacksControllerTest`), no new
ones. Frontend (`npx jest`): 8 suites / 27 tests, all passing.
`tsc --noEmit`: deleting the two old components (which had accumulated
their own implicit-`any`/prop-typing errors) more than offset the new
files' errors — non-test-file error count went from 167 to 131.

**Files:** `app/controllers/components_controller.rb`,
`app/javascript/components/Dashboard/ProfileForm.tsx` (new),
`app/javascript/components/Dashboard/FriendsPanel.tsx` (new),
`app/javascript/components/Dashboard/Dashboard.tsx` (rewritten),
`app/javascript/components/Dashboard/{Display,Edit,Edit.test}.tsx`
(deleted), `app/javascript/components/Dashboard/Wrappers/{UserInfoItem,SectionWrapper}.tsx`
(deleted), `test/controllers/components_controller_test.rb`,
`app/javascript/components/Dashboard/ProfileForm.test.tsx` (new),
`app/javascript/components/Dashboard/FriendsPanel.test.tsx` (new)

### 4.6 ✅ Dashboard follow-up fixes (routing + edit-mode UX)

Two issues reported after 4.5 landed:

1. **`/dashboard` had no server-side route.** `AppRoot.tsx`'s
   client-side switch has a `/dashboard` case, but `config/routes.rb`
   never had a matching `get '/dashboard'`, unlike every other
   client-routed page (`/trip_plan`, `/development`, etc.) — a direct
   link or a page refresh on `/dashboard` hit Rails' "no route matches"
   page instead of booting the SPA. Fixed by adding
   `get '/dashboard' => 'components#index'` alongside the other
   SPA-entry routes. Confirmed via a request test that the URL now
   resolves (redirecting to login when signed out, as every other
   `redirect_if_not_logged_in`-protected page does, instead of a
   routing error).
2. **Save didn't exit edit mode.** 4.5's `ProfileForm` was built as a
   single always-editable form with no view/edit distinction at all,
   which in practice reads as "stuck in edit mode with no way out."
   Restored a view/edit toggle, but — unlike the original pre-4.5
   `Edit.tsx` — the transition back to read-only view now only happens
   *after* a successful save (`res.ok` and no thrown error), via the
   same `onSaved`/`res.ok` check added in 4.5. Added a Cancel button to
   leave edit mode without saving, discarding any in-progress edits.

**Tests:** `test/controllers/components_controller_test.rb` (+1 — a
signed-out request to `/dashboard` redirects to login instead of
hitting a routing error), `ProfileForm.test.tsx` rewritten for the
view/edit split (7 tests: starts read-only with an Edit button,
visibility defaults once editing, a successful save exits back to
read-only and calls `onSaved`, Cancel discards edits and exits without
saving, a rejected save stays in edit mode and shows an error, a
network failure shows an error).

Full suite (`bin/rails test`): 76 runs, same 7 pre-existing unrelated
failures, no new ones. Frontend (`npx jest`): 8 suites / 29 tests, all
passing.

**Files:** `config/routes.rb`, `app/javascript/components/Dashboard/ProfileForm.tsx`,
`app/javascript/components/Dashboard/ProfileForm.test.tsx`,
`test/controllers/components_controller_test.rb`

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
