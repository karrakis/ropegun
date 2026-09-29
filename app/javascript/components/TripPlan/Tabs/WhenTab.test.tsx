import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { WhenTab } from "./WhenTab";

describe("WhenTab", () => {
  const baseTrip = (overrides: Partial<any> = {}) => ({
    id: 1,
    starts_on: null,
    ends_on: null,
    extra_data: {},
    trip_memberships: [
      { id: 10, role: "owner", accepted: true, user: { id: 1 } },
      { id: 11, role: "member", accepted: true, user: { id: 2 } },
    ],
    ...overrides,
  });

  const jsonResponse = (ok = true, body: any = {}) => ({
    ok,
    json: async () => body,
  });

  beforeEach(() => {
    document.head.innerHTML = '<meta name="csrf-token" content="test-token">';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("a non-organizer member can toggle their own availability", async () => {
    const updatedTrip = baseTrip({
      extra_data: { availability: { "2": ["2026-01-05"] } },
    });
    global.fetch = jest.fn(() =>
      Promise.resolve(jsonResponse(true, updatedTrip)),
    ) as jest.Mock;
    const onTripUpdated = jest.fn();

    render(
      <WhenTab
        trip={baseTrip()}
        localUser={{ id: 2 }}
        isOrganizer={false}
        updateTrip={jest.fn()}
        onTripUpdated={onTripUpdated}
      />,
    );

    // Click the first enabled (non-past, in-month) day in the calendar grid
    const today = new Date();
    const buttons = screen
      .getAllByRole("button")
      .filter((b) => !b.hasAttribute("disabled") && /^\d+$/.test(b.textContent?.trim().split("\n")[0] ?? ""));
    await userEvent.click(buttons[buttons.length - 1]);

    await waitFor(() => expect(onTripUpdated).toHaveBeenCalledWith(updatedTrip));
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("/api/v1/trips/1/availability");
    expect(options.method).toBe("PATCH");
  });

  test("does not render a date picker for non-organizers", () => {
    render(
      <WhenTab
        trip={baseTrip()}
        localUser={{ id: 2 }}
        isOrganizer={false}
        updateTrip={jest.fn()}
        onTripUpdated={jest.fn()}
      />,
    );
    expect(screen.queryByText("Set trip dates")).not.toBeInTheDocument();
  });

  test("renders a date picker for the organizer", () => {
    render(
      <WhenTab
        trip={baseTrip()}
        localUser={{ id: 1 }}
        isOrganizer={true}
        updateTrip={jest.fn()}
        onTripUpdated={jest.fn()}
      />,
    );
    expect(screen.getByText("Set trip dates")).toBeInTheDocument();
  });
});
