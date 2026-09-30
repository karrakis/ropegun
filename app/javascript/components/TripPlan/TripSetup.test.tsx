import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { TripSetup } from "./TripSetup";

describe("TripSetup", () => {
  const localUser = { id: 1, name: "Alice" };

  const jsonResponse = (body: any, ok = true) => ({
    ok,
    json: async () => body,
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("creates a trip with just the entered name and no locations", async () => {
    const createdTrip = { id: 42, name: "Joshua Tree Weekend" };
    global.fetch = jest.fn((url: string) => {
      if (url === "/api/v1/trips")
        return Promise.resolve(jsonResponse(createdTrip));
      return Promise.resolve(jsonResponse({}));
    }) as jest.Mock;
    const onTripCreated = jest.fn();

    render(
      <TripSetup
        localUser={localUser}
        onTripCreated={onTripCreated}
        onBack={jest.fn()}
      />,
    );

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
    await waitFor(() =>
      expect(onTripCreated).toHaveBeenCalledWith(createdTrip),
    );
  });

  test("falls back to a default name when left blank", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(jsonResponse({ id: 1 })),
    ) as jest.Mock;

    render(
      <TripSetup
        localUser={localUser}
        onTripCreated={jest.fn()}
        onBack={jest.fn()}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Create Trip →" }),
    );

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/v1/trips",
        expect.objectContaining({
          body: JSON.stringify({
            trip: { name: "My Trip", locations: [], route_mode: false },
          }),
        }),
      ),
    );
  });

  test("clicking Back invokes onBack", async () => {
    const onBack = jest.fn();
    render(
      <TripSetup
        localUser={localUser}
        onTripCreated={jest.fn()}
        onBack={onBack}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "← Back" }));
    expect(onBack).toHaveBeenCalled();
  });

  test("shows an error message when trip creation fails", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(jsonResponse({ error: "Name can't be blank" }, false)),
    ) as jest.Mock;

    render(
      <TripSetup
        localUser={localUser}
        onTripCreated={jest.fn()}
        onBack={jest.fn()}
      />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Create Trip →" }),
    );

    expect(await screen.findByText("Name can't be blank")).toBeInTheDocument();
  });
});
