import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { TripPlan } from "./TripPlan";

// TripPlan subscribes to TripChannel whenever a trip is open — jsdom has no
// real ActionCable server, so stub the consumer the same way AppRoot.test
// does for FriendshipsChannel.
jest.mock("../../utilities/cable", () => ({
  getConsumer: () => ({
    subscriptions: {
      create: () => ({ unsubscribe: () => {} }),
    },
  }),
}));

// DestinationSelector wraps @vis.gl/react-google-maps, which needs a real
// Google Maps script and isn't meaningful to exercise in jsdom. Stub it out
// with a fake "pick a destination" button that invokes onDestinationAdded
// directly, so this test can focus on how TripPlan wires the full-page
// add-location step into a PATCH request + navigation back to the editor.
jest.mock("../Map/DestinationSelector", () => ({
  DestinationSelector: ({ onDestinationAdded }: any) => (
    <button
      onClick={() =>
        onDestinationAdded({
          name: "Joshua Tree",
          latitude: "33.8734",
          longitude: "-115.9010",
          office: null,
          office_x: null,
          office_y: null,
        })
      }
    >
      Pick Joshua Tree
    </button>
  ),
}));

describe("TripPlan — add location to an existing trip", () => {
  const localUser = { id: 1, name: "Alice" };

  const jsonResponse = (body: any, ok = true) => ({
    ok,
    json: async () => body,
  });

  const trip = {
    id: 42,
    name: "Desert Trip",
    owner: { id: 1 },
    locations: [],
    route_mode: false,
  };

  beforeEach(() => {
    window.history.pushState({}, "", "/trip_plan/42");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("Add location navigates to a full-page map, then PATCHes the trip and returns to the editor", async () => {
    const updatedTrip = {
      ...trip,
      locations: [
        {
          id: 1,
          name: "Joshua Tree",
          latitude: "33.8734",
          longitude: "-115.9010",
        },
      ],
    };
    global.fetch = jest.fn((url: string, opts?: any) => {
      if (url === "/api/v1/trips/42" && (!opts || opts.method === undefined)) {
        return Promise.resolve(jsonResponse(trip));
      }
      if (url === "/api/v1/trips/42" && opts?.method === "PATCH") {
        return Promise.resolve(jsonResponse(updatedTrip));
      }
      return Promise.resolve(jsonResponse({}));
    }) as jest.Mock;

    render(<TripPlan localUser={localUser} />);

    // Trip loads and renders the editor, defaulting to the Where tab.
    expect(
      await screen.findByText("No locations on this trip."),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "+ Add location" }),
    );

    // Full-page map step, not a modal.
    expect(await screen.findByText("Add a location")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/trip_plan/42/add_location");

    await userEvent.click(
      screen.getByRole("button", { name: "Pick Joshua Tree" }),
    );

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/v1/trips/42",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({
            trip: {
              locations: [
                {
                  name: "Joshua Tree",
                  latitude: "33.8734",
                  longitude: "-115.9010",
                  office: null,
                  office_x: null,
                  office_y: null,
                },
              ],
            },
          }),
        }),
      ),
    );

    // Back on the editor, with the new location applied and no more map screen.
    await waitFor(() => expect(window.location.pathname).toBe("/trip_plan/42"));
    expect(await screen.findByText("Joshua Tree")).toBeInTheDocument();
    expect(screen.queryByText("Add a location")).not.toBeInTheDocument();
  });

  test("a failed PATCH shows an error and stays on the add-location screen", async () => {
    global.fetch = jest.fn((url: string, opts?: any) => {
      if (url === "/api/v1/trips/42" && (!opts || opts.method === undefined)) {
        return Promise.resolve(jsonResponse(trip));
      }
      if (url === "/api/v1/trips/42" && opts?.method === "PATCH") {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: async () => ({}),
        });
      }
      return Promise.resolve(jsonResponse({}));
    }) as jest.Mock;

    render(<TripPlan localUser={localUser} />);

    await screen.findByText("No locations on this trip.");
    await userEvent.click(
      screen.getByRole("button", { name: "+ Add location" }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Pick Joshua Tree" }),
    );

    expect(await screen.findByText("Server error 500")).toBeInTheDocument();
    // Stays on the map step rather than bouncing back to the editor.
    expect(window.location.pathname).toBe("/trip_plan/42/add_location");
    expect(screen.getByText("Add a location")).toBeInTheDocument();
  });

  test("the Back caret returns to the editor without mutating the trip", async () => {
    global.fetch = jest.fn((url: string) => {
      if (url === "/api/v1/trips/42")
        return Promise.resolve(jsonResponse(trip));
      return Promise.resolve(jsonResponse({}));
    }) as jest.Mock;

    render(<TripPlan localUser={localUser} />);

    await screen.findByText("No locations on this trip.");
    await userEvent.click(
      screen.getByRole("button", { name: "+ Add location" }),
    );
    await screen.findByText("Add a location");

    await userEvent.click(screen.getByRole("button", { name: "Back" }));

    await waitFor(() => expect(window.location.pathname).toBe("/trip_plan/42"));
    expect(screen.queryByText("Add a location")).not.toBeInTheDocument();
    expect(
      (global.fetch as jest.Mock).mock.calls.some(
        ([, opts]) => opts?.method === "PATCH",
      ),
    ).toBe(false);
  });

  test("the old floating '+ New trip' button no longer renders on the editor screen", async () => {
    global.fetch = jest.fn((url: string) => {
      if (url === "/api/v1/trips/42")
        return Promise.resolve(jsonResponse(trip));
      return Promise.resolve(jsonResponse({}));
    }) as jest.Mock;

    render(<TripPlan localUser={localUser} />);

    await screen.findByText("No locations on this trip.");
    expect(
      screen.queryByRole("button", { name: "+ New trip" }),
    ).not.toBeInTheDocument();
  });
});

describe("TripPlan — creating a new trip", () => {
  const localUser = { id: 1, name: "Alice" };

  const jsonResponse = (body: any, ok = true) => ({
    ok,
    json: async () => body,
  });

  beforeEach(() => {
    window.history.pushState({}, "", "/trip_plan");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("Home -> Start a new trip -> name it -> lands directly on the editor", async () => {
    const createdTrip = {
      id: 7,
      name: "Joshua Tree Weekend",
      owner: { id: 1 },
      locations: [],
      route_mode: false,
    };
    global.fetch = jest.fn((url: string, opts?: any) => {
      if (url === "/api/v1/trips" && opts?.method === "POST") {
        return Promise.resolve(jsonResponse(createdTrip));
      }
      return Promise.resolve(jsonResponse({}));
    }) as jest.Mock;

    render(<TripPlan localUser={localUser} />);

    await userEvent.click(
      screen.getByRole("button", { name: "+ Start a new trip" }),
    );
    expect(window.location.pathname).toBe("/trip_plan/new");

    await userEvent.type(
      screen.getByLabelText("Trip name"),
      "Joshua Tree Weekend",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Create Trip →" }),
    );

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/v1/trips",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            trip: {
              name: "Joshua Tree Weekend",
              locations: [],
              route_mode: false,
            },
          }),
        }),
      ),
    );

    // Lands directly on the trip editor, defaulting to the Where tab.
    await waitFor(() => expect(window.location.pathname).toBe("/trip_plan/7"));
    expect(
      await screen.findByText("No locations on this trip."),
    ).toBeInTheDocument();
  });
});
