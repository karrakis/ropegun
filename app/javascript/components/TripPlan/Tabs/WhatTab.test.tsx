import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { WhatTab } from "./WhatTab";

// GearSubTab isn't exported directly, so we drive it through WhatTab, which
// defaults to the "gear" sub-tab on mount. This is the reference pattern for
// testing the other TripPlan tab components: mock `fetch` per-URL, render
// through the public tab component, and assert on rendered state + the
// fetch calls made in response to user interaction.
describe("WhatTab (gear sub-tab)", () => {
  const localUser = { id: 1, name: "Alice" };

  const baseTrip = (overrides: Partial<any> = {}) => ({
    id: 42,
    trip_gear_items: [],
    ...overrides,
  });

  const jsonResponse = (body: any) => ({
    ok: true,
    json: async () => body,
  });

  beforeEach(() => {
    global.fetch = jest.fn((url: string) => {
      if (url === "/api/v1/gear_items") {
        return Promise.resolve(jsonResponse([]));
      }
      return Promise.resolve(jsonResponse({}));
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("shows an empty state when the trip has no gear yet", async () => {
    render(
      <WhatTab
        trip={baseTrip()}
        localUser={localUser}
        isOrganizer={false}
        onTripUpdated={jest.fn()}
      />,
    );
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/v1/gear_items",
        expect.anything(),
      ),
    );
    expect(screen.getByText("No gear on this trip yet.")).toBeInTheDocument();
  });

  test("shows needed/committed counts for existing gear items", async () => {
    const trip = baseTrip({
      trip_gear_items: [
        {
          id: 100,
          gear_item_id: 5,
          gear_item: { name: "Tent" },
          required_quantity: 2,
          committed_quantity: 1,
          commitments: [{ user_id: 2, user_name: "Bob", quantity: 1 }],
        },
      ],
    });
    render(
      <WhatTab
        trip={trip}
        localUser={localUser}
        isOrganizer={false}
        onTripUpdated={jest.fn()}
      />,
    );
    expect(await screen.findByText("Tent")).toBeInTheDocument();
    expect(screen.getByTitle("Needed")).toHaveTextContent("1");
    expect(screen.getByTitle("Committed")).toHaveTextContent("1");
    expect(screen.getByText("Bob (1)")).toBeInTheDocument();
  });

  test("non-organizers cannot see the catalogue or remove controls", async () => {
    const trip = baseTrip({
      trip_gear_items: [
        {
          id: 100,
          gear_item_id: 5,
          gear_item: { name: "Tent" },
          required_quantity: 2,
          committed_quantity: 0,
          commitments: [],
        },
      ],
    });
    render(
      <WhatTab
        trip={trip}
        localUser={localUser}
        isOrganizer={false}
        onTripUpdated={jest.fn()}
      />,
    );
    await screen.findByText("Tent");
    expect(
      screen.queryByText("+ Add gear from catalogue"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Remove")).not.toBeInTheDocument();
  });

  test("committing to a gear item POSTs the quantity and applies the updated trip", async () => {
    const trip = baseTrip({
      trip_gear_items: [
        {
          id: 100,
          gear_item_id: 5,
          gear_item: { name: "Tent" },
          required_quantity: 2,
          committed_quantity: 0,
          commitments: [],
        },
      ],
    });
    const updatedTrip = { ...trip, trip_gear_items: [] };
    (global.fetch as jest.Mock).mockImplementation(
      (url: string, options?: any) => {
        if (url === "/api/v1/gear_items")
          return Promise.resolve(jsonResponse([]));
        if (url === "/api/v1/trip_gear_items/100/commit") {
          return Promise.resolve(jsonResponse(updatedTrip));
        }
        return Promise.resolve(jsonResponse({}));
      },
    );
    const onTripUpdated = jest.fn();
    render(
      <WhatTab
        trip={trip}
        localUser={localUser}
        isOrganizer={false}
        onTripUpdated={onTripUpdated}
      />,
    );
    await screen.findByText("Tent");
    await userEvent.click(
      screen.getByRole("button", { name: "I'll bring this" }),
    );

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/v1/trip_gear_items/100/commit",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ user_id: localUser.id, quantity: 1 }),
        }),
      ),
    );
    await waitFor(() =>
      expect(onTripUpdated).toHaveBeenCalledWith(updatedTrip),
    );
  });

  test("organizers can remove a gear item, issuing a DELETE", async () => {
    const trip = baseTrip({
      trip_gear_items: [
        {
          id: 100,
          gear_item_id: 5,
          gear_item: { name: "Tent" },
          required_quantity: 2,
          committed_quantity: 0,
          commitments: [],
        },
      ],
    });
    const updatedTrip = { ...trip, trip_gear_items: [] };
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === "/api/v1/gear_items")
        return Promise.resolve(jsonResponse([]));
      if (url === "/api/v1/trip_gear_items/100") {
        return Promise.resolve(jsonResponse(updatedTrip));
      }
      return Promise.resolve(jsonResponse({}));
    });
    const onTripUpdated = jest.fn();
    render(
      <WhatTab
        trip={trip}
        localUser={localUser}
        isOrganizer={true}
        onTripUpdated={onTripUpdated}
      />,
    );
    await screen.findByText("Tent");
    await userEvent.click(screen.getByRole("button", { name: "Remove" }));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/v1/trip_gear_items/100",
        expect.objectContaining({ method: "DELETE" }),
      ),
    );
    await waitFor(() =>
      expect(onTripUpdated).toHaveBeenCalledWith(updatedTrip),
    );
  });
});
