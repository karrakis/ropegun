# Trip Summary — Build Plan

## Overview

After a trip is created (locations set, name and mode chosen), the user lands on the Trip Summary screen. This is the primary trip management interface and the screen a shared link will load for non-owners.

The screen uses a tab structure at the top of the content area. Tabs: **Where · When · Who · What**. A share button lives in the app header (top right), not inside any tab.

---

## Tab: Where

### Locations list

- Displays all trip locations in order (route mode) or as a flat list (compare mode).
- In compare mode, the organizer sees a "Choose this destination" button on each location card. Choosing one transitions the trip to single-location route mode (other locations are removed from the trip, not archived — consider an "are you sure?" confirmation).
- Each location card links to its sub-tab content.

### Sub-tabs per location (or shared, if single location)

#### Weather

- Line graph overlay for temperature (°C or °F, user preference) and a separate tab for precipitation probability.
- Data source: Open-Meteo (global, free, 16-day horizon, no API key).
- If trip dates are not yet set: show the current 16-day window, with a note that the view will anchor to the trip dates once they are chosen.
- If trip dates are set: anchor the displayed forecast range to those dates. If the dates are outside the 16-day window, show a "forecast not yet available — check back closer to the trip" message.
- Weather data is cached on the `Location` model (`weather` JSONB, `weather_source`, `weather_last_updated`). Refresh if `weather_last_updated` is older than 24 hours.
- Multiple locations: overlay all locations on the same graph (matching the existing GraphSwitcher pattern), using distinct colours per location.

#### Distances

- Default: driving distance and estimated drive time, calculated via Google Maps Distance Matrix API and cached in the `distances` table.
- **Average distance**: computed from home addresses of all trip members who have provided one. Displayed as a single summary row.
- **Per-member breakdown**: visible to the organizer only. Lists each member's individual drive time/distance. Intended to surface situations where one person has a disproportionately long drive. Not shown to other members.
- Home addresses are stored on user profiles but are never displayed to other users (display name only on public-facing views).
- Members without a home address are excluded from distance calculations with a note ("N members have not provided an address").

#### Notes

- Free-text field for the organizer to add location-specific notes (cultural context, access warnings, language notes, etc.).
- Read-only for non-organizers.
- Stored in `trips.extra_data` JSONB as `{ notes: { location_id: "text" } }` until a dedicated `trip_notes` table is warranted.

---

## Tab: When

### Before dates are set

- **When-is-good calendar**: members mark days they _can_ attend (positive commitment model — unmarked days are assumed unavailable).
- Stored in `trips.extra_data` as `{ availability: { user_id: ["2026-10-15", ...] } }` until a dedicated table is needed.
- Visualisation: calendar grid where each day shows a count of available members. Organizer can see at a glance which dates have the most coverage.
- The organizer has a "Set these dates" button that appears when they hover/select a date range on the calendar.

### After dates are set

- The selected date range is displayed prominently at the top of the tab.
- The when-is-good calendar becomes read-only and is collapsed below the date range (available to review but not the focus).
- Any members who marked the chosen dates as unavailable are flagged with a soft warning (organizer-visible only): "2 members marked these dates as unavailable."
- The organizer can edit/clear the dates to reopen the when-is-good process.

---

## Tab: Who

### Member list

- All members (account holders + anonymous guests) displayed in a single alphabetically sorted list.
- Account holders: name is a link to their profile.
- Anonymous guests: name as plain text (added via share link).
- The organizer is lifted to the top of the list with a card that has a decorative border and the word "organizer" interrupting the border in small caps (CSS `fieldset`/`legend` style or equivalent).
- Each member shows their RSVP status (accepted / invited / guest).

### Organizer controls

- Remove button on each entry (organizer only). For account holders, this revokes their `TripMembership`. For anonymous guests, this removes them from `trips.guest_list`.
- Invite button: opens an invite flow that creates a `TripMembership` with `role: :invited, accepted: false`. The invited user sees the pending invite on their dashboard.

### Invite flow (replaces old TripInvitations)

- Uses `TripMembership` exclusively. No new records are written to the `trip_invitations` table.
- Organizer searches by email or friendship UUID (existing Friends system).
- Invited users see a pending invite card on their dashboard with Accept / Decline.
- Accepting: sets `accepted: true`, `role: :member`, `joined_at: now`.
- Declining: destroys the membership record.

### Share link

- Also accessible from a share button in the app header (top right), available on any trip screen.
- Displayed here as a copyable URL: `https://app.example.com/trips/{share_token}`.
- Visiting this link as a logged-out user: presents a read-only trip view with an "Add yourself as a guest" form (name only, no account required). Submission appends to `trips.guest_list`.
- Visiting as a logged-in user: presents the same read-only view with a "Join this trip" button that creates a `TripMembership` with `role: :member, accepted: true`.
- **Route needed**: `GET /trips/:share_token` → new `TripsController#public_show` action (no auth required).

---

## Tab: What

### Activity

- Free-text or tag-based description of what the trip is for (sport climbing, trad, alpine, bouldering, mixed). Stored in `trips.extra_data[:activity]`.
- Future: could pre-filter the gear/skills catalogue by activity type.

### Gear sub-tab

#### Gear list

- The organizer curates which gear items appear on the trip list (from the shared `gear_items` catalogue).
- Each item displays two counters:
  - 🔴 **Needed** — quantity the organizer has specified as required. Defaults to 1 per item.
  - 🔵 **Committed** — sum of quantities committed by all members via `trip_gear_items`.
  - When committed ≥ needed, the item is visually marked as covered (e.g. green check).
- Any member can click an item to commit to bringing it (and specify quantity). Their commitment is recorded in `trip_gear_items`.
- Members can withdraw their commitment.
- Required quantity is editable by the organizer only.

### Skills sub-tab

#### Skills list

- The organizer curates which skills are relevant to the trip.
- Each skill is displayed once, with the committing members listed beneath: `Lead Belay — George, Alison`.
- Any member can volunteer a skill by clicking it (creates a `trip_skills` record).
- Members can un-volunteer.
- Skills the organizer marks as "required" are visually distinguished (e.g. bold or flagged).

---

## Navigation & Layout

- Tabs at the top of the content area (below the app header). Top-of-page tabs are acceptable for both mobile and desktop — they don't require thumb gymnastics and avoid CSS complexity.
- On mobile, tab labels may truncate to icons with a short label below if horizontal space is tight.
- The app header retains the share button (top right) regardless of which tab is active.

---

## Backend work required

| Feature                            | Endpoint / Model change                                                           |
| ---------------------------------- | --------------------------------------------------------------------------------- |
| Weather fetch + cache              | `GET /api/v1/locations/:id/weather` — fetches Open-Meteo if stale, returns cached |
| Distances (average + per-member)   | `POST /api/v1/trips/:id/distances` — triggers Google Maps calls, caches results   |
| When-is-good availability          | `PUT /api/v1/trips/:id/availability` — writes to `extra_data`                     |
| Set trip dates                     | `PATCH /api/v1/trips/:id` (already exists, needs `starts_on`/`ends_on`)           |
| Invite member                      | `POST /api/v1/trip_memberships`                                                   |
| Accept / decline invite            | `PATCH /api/v1/trip_memberships/:id`                                              |
| Remove member                      | `DELETE /api/v1/trip_memberships/:id`                                             |
| Add anonymous guest                | `POST /trips/:share_token/guests` (no auth)                                       |
| Public share view                  | `GET /trips/:share_token` (no auth)                                               |
| Commit gear                        | `POST /api/v1/trip_gear_items`                                                    |
| Commit skill                       | `POST /api/v1/trip_skills`                                                        |
| Notes (per location)               | `PATCH /api/v1/trips/:id` with `extra_data` payload                               |
| Choose destination (compare→route) | `PATCH /api/v1/trips/:id` — sets `route_mode: true`, removes other locations      |

---

## MVP sequencing

1. **Where** — location list + distances (no weather yet, distances are immediately useful)
2. **Who** — member list, invite via TripMembership, share link + public view
3. **When** — date picking first; when-is-good calendar second
4. **What** — gear commitment first (higher practical value); skills second
5. **Weather** — Open-Meteo integration, graph display (build after the tab structure is stable)

---

## Out of scope for MVP

- Anonymous voting on locations (organizer chooses manually for now)
- Push / SMS notifications (separate card — needs phone number on user profile and a notification service)
- Gear "required quantity" per activity type (flat organizer-specified list for now)
- Trip photo sharing and forum (post-MVP)
- Profile page beyond basic info + home address
