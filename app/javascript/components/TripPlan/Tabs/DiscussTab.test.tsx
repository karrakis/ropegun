import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { DiscussTab } from "./DiscussTab";

describe("DiscussTab", () => {
  const localUser = { id: 1, name: "Alice" };

  const baseTrip = (overrides: Partial<any> = {}) => ({
    id: 42,
    trip_comments: [],
    ...overrides,
  });

  const jsonResponse = (body: any, ok = true) => ({
    ok,
    json: async () => body,
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("shows an empty state when the trip has no comments yet", () => {
    render(
      <DiscussTab
        trip={baseTrip()}
        localUser={localUser}
        isOrganizer={false}
        onTripUpdated={jest.fn()}
      />,
    );
    expect(screen.getByText("No comments yet.")).toBeInTheDocument();
  });

  test("renders existing comments oldest first", () => {
    const trip = baseTrip({
      trip_comments: [
        {
          id: 2,
          body: "Second comment",
          user: { id: 2, name: "Bob" },
          created_at: "2026-09-28T12:00:00Z",
        },
        {
          id: 1,
          body: "First comment",
          user: { id: 1, name: "Alice" },
          created_at: "2026-09-28T10:00:00Z",
        },
      ],
    });
    render(
      <DiscussTab
        trip={trip}
        localUser={localUser}
        isOrganizer={false}
        onTripUpdated={jest.fn()}
      />,
    );
    const names = screen.getAllByText(/Alice|Bob/).map((el) => el.textContent);
    expect(names).toEqual(["Alice", "Bob"]);
  });

  test("posting a comment POSTs the body and applies the updated trip", async () => {
    const trip = baseTrip();
    const updatedTrip = {
      ...trip,
      trip_comments: [
        {
          id: 1,
          body: "Bringing the 70m.",
          user: localUser,
          created_at: "2026-09-28T12:00:00Z",
        },
      ],
    };
    global.fetch = jest.fn((url: string) => {
      if (url === "/api/v1/trips/42/comments") {
        return Promise.resolve(jsonResponse(updatedTrip));
      }
      return Promise.resolve(jsonResponse({}));
    }) as jest.Mock;
    const onTripUpdated = jest.fn();
    render(
      <DiscussTab
        trip={trip}
        localUser={localUser}
        isOrganizer={false}
        onTripUpdated={onTripUpdated}
      />,
    );

    await userEvent.type(
      screen.getByPlaceholderText("Add a comment…"),
      "Bringing the 70m.",
    );
    await userEvent.click(screen.getByRole("button", { name: "Post" }));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/v1/trips/42/comments",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ body: "Bringing the 70m." }),
        }),
      ),
    );
    await waitFor(() =>
      expect(onTripUpdated).toHaveBeenCalledWith(updatedTrip),
    );
  });

  test("the Post button is disabled until there is non-whitespace text", async () => {
    render(
      <DiscussTab
        trip={baseTrip()}
        localUser={localUser}
        isOrganizer={false}
        onTripUpdated={jest.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Post" })).toBeDisabled();
    await userEvent.type(screen.getByPlaceholderText("Add a comment…"), "   ");
    expect(screen.getByRole("button", { name: "Post" })).toBeDisabled();
  });

  test("a member can remove their own comment, issuing a DELETE", async () => {
    const trip = baseTrip({
      trip_comments: [
        {
          id: 5,
          body: "Delete me",
          user: { id: 1, name: "Alice" },
          created_at: "2026-09-28T12:00:00Z",
        },
      ],
    });
    const updatedTrip = { ...trip, trip_comments: [] };
    global.fetch = jest.fn((url: string) => {
      if (url === "/api/v1/trip_comments/5") {
        return Promise.resolve(jsonResponse(updatedTrip));
      }
      return Promise.resolve(jsonResponse({}));
    }) as jest.Mock;
    const onTripUpdated = jest.fn();
    render(
      <DiscussTab
        trip={trip}
        localUser={localUser}
        isOrganizer={false}
        onTripUpdated={onTripUpdated}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Remove" }));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/v1/trip_comments/5",
        expect.objectContaining({ method: "DELETE" }),
      ),
    );
    await waitFor(() =>
      expect(onTripUpdated).toHaveBeenCalledWith(updatedTrip),
    );
  });

  test("a non-author, non-organizer member cannot see a Remove control", () => {
    const trip = baseTrip({
      trip_comments: [
        {
          id: 5,
          body: "Not yours",
          user: { id: 2, name: "Bob" },
          created_at: "2026-09-28T12:00:00Z",
        },
      ],
    });
    render(
      <DiscussTab
        trip={trip}
        localUser={localUser}
        isOrganizer={false}
        onTripUpdated={jest.fn()}
      />,
    );
    expect(screen.queryByText("Remove")).not.toBeInTheDocument();
  });

  test("the organizer can see a Remove control on any comment", () => {
    const trip = baseTrip({
      trip_comments: [
        {
          id: 5,
          body: "Not mine, but I'm the organizer",
          user: { id: 2, name: "Bob" },
          created_at: "2026-09-28T12:00:00Z",
        },
      ],
    });
    render(
      <DiscussTab
        trip={trip}
        localUser={localUser}
        isOrganizer={true}
        onTripUpdated={jest.fn()}
      />,
    );
    expect(screen.getByText("Remove")).toBeInTheDocument();
  });
});
