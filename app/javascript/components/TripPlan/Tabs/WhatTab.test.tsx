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
    await userEvent.clear(screen.getByRole("spinbutton"));
    await userEvent.type(screen.getByRole("spinbutton"), "1");
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

  test("the commit quantity field defaults to 0 and can be fully cleared", async () => {
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
    const input = screen.getByRole("spinbutton");
    expect(input).toHaveValue(0);

    await userEvent.clear(input);
    expect(input).toHaveValue(null);

    await userEvent.click(document.body);
    expect(input).toHaveValue(0);
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

  test("the catalogue can be filtered by a search query", async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === "/api/v1/gear_items") {
        return Promise.resolve(
          jsonResponse([
            { id: 1, name: "Climbing Helmet", category: "personal" },
            { id: 2, name: "Climbing Harness", category: "personal" },
            { id: 3, name: "12cm Quickdraw", category: "sport" },
          ]),
        );
      }
      return Promise.resolve(jsonResponse({}));
    });
    render(
      <WhatTab
        trip={baseTrip()}
        localUser={localUser}
        isOrganizer={true}
        onTripUpdated={jest.fn()}
      />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "+ Add gear from catalogue" }),
    );
    expect(await screen.findByText("Climbing Helmet")).toBeInTheDocument();
    expect(screen.getByText("Climbing Harness")).toBeInTheDocument();
    expect(screen.getByText("12cm Quickdraw")).toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText("Search gear…"), "helmet");

    expect(screen.getByText("Climbing Helmet")).toBeInTheDocument();
    expect(screen.queryByText("Climbing Harness")).not.toBeInTheDocument();
    expect(screen.queryByText("12cm Quickdraw")).not.toBeInTheDocument();
  });
});

describe("WhatTab (skills sub-tab)", () => {
  const localUser = { id: 1, name: "Alice" };

  const baseTrip = (overrides: Partial<any> = {}) => ({
    id: 42,
    trip_skills: [],
    ...overrides,
  });

  const jsonResponse = (body: any) => ({
    ok: true,
    json: async () => body,
  });

  beforeEach(() => {
    global.fetch = jest.fn((url: string) => {
      if (url === "/api/v1/skills") {
        return Promise.resolve(jsonResponse([]));
      }
      return Promise.resolve(jsonResponse({}));
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const switchToSkillsTab = async () => {
    await userEvent.click(screen.getByRole("button", { name: "Skills" }));
  };

  test("organizers can remove a skill, issuing a DELETE", async () => {
    const trip = baseTrip({
      trip_skills: [
        {
          id: 200,
          skill_id: 7,
          skill: { name: "First Aid" },
          volunteers: [],
        },
      ],
    });
    const updatedTrip = { ...trip, trip_skills: [] };
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === "/api/v1/skills") return Promise.resolve(jsonResponse([]));
      if (url === "/api/v1/trip_skills/200") {
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
    await switchToSkillsTab();
    await screen.findByText("First Aid");
    await userEvent.click(screen.getByRole("button", { name: "Remove" }));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/v1/trip_skills/200",
        expect.objectContaining({ method: "DELETE" }),
      ),
    );
    await waitFor(() =>
      expect(onTripUpdated).toHaveBeenCalledWith(updatedTrip),
    );
  });

  test("non-organizers cannot see a remove control for skills", async () => {
    const trip = baseTrip({
      trip_skills: [
        {
          id: 200,
          skill_id: 7,
          skill: { name: "First Aid" },
          volunteers: [],
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
    await switchToSkillsTab();
    await screen.findByText("First Aid");
    expect(
      screen.queryByRole("button", { name: "Remove" }),
    ).not.toBeInTheDocument();
  });
});
