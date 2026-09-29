import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { WhoTab } from "./WhoTab";

describe("WhoTab", () => {
  const baseTrip = (overrides: Partial<any> = {}) => ({
    id: 1,
    name: "Alpine Traverse",
    share_token: "share-token-abc",
    extra_data: {},
    guest_list: [],
    trip_memberships: [
      {
        id: 10,
        role: "owner",
        accepted: true,
        user: { id: 1, name: "Alice", email: "alice@example.com", uuid: "alice-uuid" },
      },
      {
        id: 11,
        role: "member",
        accepted: true,
        user: { id: 2, name: "Bob", email: "bob@example.com", uuid: "bob-uuid" },
      },
    ],
    ...overrides,
  });

  const localUser = (id: number) => ({ id, friendships: [] });

  const jsonResponse = (ok = true, body: any = {}) => ({
    ok,
    json: async () => body,
  });

  beforeEach(() => {
    document.head.innerHTML = '<meta name="csrf-token" content="test-token">';
    global.confirm = jest.fn(() => true) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("a non-organizer member sees a Leave trip button, not Cancel trip or Make organizer", () => {
    render(
      <WhoTab
        trip={baseTrip()}
        localUser={localUser(2)}
        isOrganizer={false}
        onTripUpdated={jest.fn()}
        onBack={jest.fn()}
      />,
    );
    expect(screen.getByText("Leave trip")).toBeInTheDocument();
    expect(screen.queryByText("Cancel trip")).not.toBeInTheDocument();
    expect(screen.queryByText("Make organizer")).not.toBeInTheDocument();
  });

  test("the organizer sees Cancel trip and Make organizer, not Leave trip", () => {
    render(
      <WhoTab
        trip={baseTrip()}
        localUser={localUser(1)}
        isOrganizer={true}
        onTripUpdated={jest.fn()}
        onBack={jest.fn()}
      />,
    );
    expect(screen.getByText("Cancel trip")).toBeInTheDocument();
    expect(screen.getByText("Make organizer")).toBeInTheDocument();
    expect(screen.queryByText("Leave trip")).not.toBeInTheDocument();
  });

  test("leaving a trip DELETEs the member's own membership and navigates back", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(jsonResponse(true, { id: 1 })),
    ) as jest.Mock;
    const onBack = jest.fn();
    render(
      <WhoTab
        trip={baseTrip()}
        localUser={localUser(2)}
        isOrganizer={false}
        onTripUpdated={jest.fn()}
        onBack={onBack}
      />,
    );

    await userEvent.click(screen.getByText("Leave trip"));

    await waitFor(() => expect(onBack).toHaveBeenCalled());
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("/api/v1/trip_memberships/11");
    expect(options.method).toBe("DELETE");
  });

  test("canceling a trip DELETEs the trip and navigates back", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(jsonResponse(true)),
    ) as jest.Mock;
    const onBack = jest.fn();
    render(
      <WhoTab
        trip={baseTrip()}
        localUser={localUser(1)}
        isOrganizer={true}
        onTripUpdated={jest.fn()}
        onBack={onBack}
      />,
    );

    await userEvent.click(screen.getByText("Cancel trip"));

    await waitFor(() => expect(onBack).toHaveBeenCalled());
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("/api/v1/trips/1");
    expect(options.method).toBe("DELETE");
  });

  test("making another member the organizer PATCHes transfer_owner with their user id", async () => {
    const updatedTrip = baseTrip();
    global.fetch = jest.fn(() =>
      Promise.resolve(jsonResponse(true, updatedTrip)),
    ) as jest.Mock;
    const onTripUpdated = jest.fn();
    render(
      <WhoTab
        trip={baseTrip()}
        localUser={localUser(1)}
        isOrganizer={true}
        onTripUpdated={onTripUpdated}
        onBack={jest.fn()}
      />,
    );

    await userEvent.click(screen.getByText("Make organizer"));

    await waitFor(() => expect(onTripUpdated).toHaveBeenCalledWith(updatedTrip));
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("/api/v1/trips/1/transfer_owner");
    expect(options.method).toBe("PATCH");
    expect(JSON.parse(options.body)).toEqual({ new_owner_id: 2 });
  });

  test("shows the server's error message if leaving fails", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(jsonResponse(false, { error: "Unauthorized" })),
    ) as jest.Mock;
    const onBack = jest.fn();
    render(
      <WhoTab
        trip={baseTrip()}
        localUser={localUser(2)}
        isOrganizer={false}
        onTripUpdated={jest.fn()}
        onBack={onBack}
      />,
    );

    await userEvent.click(screen.getByText("Leave trip"));

    await waitFor(() => expect(screen.getByText("Unauthorized")).toBeInTheDocument());
    expect(onBack).not.toHaveBeenCalled();
  });
});
