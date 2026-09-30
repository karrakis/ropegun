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
