import React from "react";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { WhereTab } from "./WhereTab";

// Adding a location is now a full-page step owned by TripPlan (see
// TripPlan.tsx's "add_location" screen) rather than something WhereTab does
// itself — WhereTab just asks its parent to navigate there via
// onAddLocation. See TripPlan.tsx for coverage of the actual map/PATCH flow.
describe("WhereTab — Add location", () => {
  const localUser = { id: 1, name: "Alice" };

  const baseTrip = (overrides: Partial<any> = {}) => ({
    id: 42,
    locations: [],
    route_mode: false,
    ...overrides,
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("the organizer sees an Add location button even with zero locations", () => {
    render(
      <WhereTab
        trip={baseTrip()}
        localUser={localUser}
        isOrganizer={true}
        onTripUpdated={jest.fn()}
        onAddLocation={jest.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: "+ Add location" }),
    ).toBeInTheDocument();
    expect(screen.getByText("No locations on this trip.")).toBeInTheDocument();
  });

  test("a non-organizer does not see the Add location button", () => {
    render(
      <WhereTab
        trip={baseTrip()}
        localUser={localUser}
        isOrganizer={false}
        onTripUpdated={jest.fn()}
        onAddLocation={jest.fn()}
      />,
    );
    expect(
      screen.queryByRole("button", { name: "+ Add location" }),
    ).not.toBeInTheDocument();
  });

  test("clicking Add location invokes onAddLocation", async () => {
    const onAddLocation = jest.fn();
    render(
      <WhereTab
        trip={baseTrip()}
        localUser={localUser}
        isOrganizer={true}
        onTripUpdated={jest.fn()}
        onAddLocation={onAddLocation}
      />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "+ Add location" }),
    );
    expect(onAddLocation).toHaveBeenCalledTimes(1);
  });
});

describe("WhereTab — Overview packing list", () => {
  const localUser = { id: 1, name: "Alice" };

  const baseTrip = (overrides: Partial<any> = {}) => ({
    id: 42,
    locations: [],
    route_mode: false,
    ...overrides,
  });

  test("shows a placeholder when the local user has no gear commitments", () => {
    render(
      <WhereTab
        trip={baseTrip({ trip_gear_items: [] })}
        localUser={localUser}
        isOrganizer={true}
        onTripUpdated={jest.fn()}
        onAddLocation={jest.fn()}
      />,
    );
    expect(screen.getByText("Your packing list")).toBeInTheDocument();
    expect(
      screen.getByText("You haven't committed to bring any gear yet."),
    ).toBeInTheDocument();
  });

  test("lists only gear items the local user has committed to bring, with quantity", () => {
    const trip = baseTrip({
      trip_gear_items: [
        {
          id: 1,
          gear_item: { name: "Tent" },
          commitments: [{ user_id: 1, user_name: "Alice", quantity: 2 }],
        },
        {
          id: 2,
          gear_item: { name: "Stove" },
          commitments: [{ user_id: 2, user_name: "Bob", quantity: 1 }],
        },
        {
          id: 3,
          gear_item: { name: "Lantern" },
          commitments: [{ user_id: 1, user_name: "Alice", quantity: 0 }],
        },
      ],
    });
    render(
      <WhereTab
        trip={trip}
        localUser={localUser}
        isOrganizer={true}
        onTripUpdated={jest.fn()}
        onAddLocation={jest.fn()}
      />,
    );
    expect(screen.getByText("Tent")).toBeInTheDocument();
    expect(screen.getByText("× 2")).toBeInTheDocument();
    expect(screen.queryByText("Stove")).not.toBeInTheDocument();
    expect(screen.queryByText("Lantern")).not.toBeInTheDocument();
  });
});
