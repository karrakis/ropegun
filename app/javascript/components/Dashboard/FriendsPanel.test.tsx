import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { FriendsPanel } from "./FriendsPanel";

describe("FriendsPanel", () => {
  const baseLocalUser = (overrides: Partial<any> = {}) => ({
    id: 1,
    friendships: [],
    pending_friendship_invitations: [],
    pending_friend_requests: [],
    pending_trip_invitations: [],
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

  test("shows empty states when there is nothing to show", () => {
    render(<FriendsPanel localUser={baseLocalUser()} />);
    expect(screen.getByText("No pending invites.")).toBeInTheDocument();
    expect(screen.getByText("No outgoing requests.")).toBeInTheDocument();
    expect(screen.getByText("No friends yet.")).toBeInTheDocument();
    expect(
      screen.getByText("No pending trip invitations."),
    ).toBeInTheDocument();
  });

  test("sending a friend invite POSTs and adds it to sent requests", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(jsonResponse(true)),
    ) as jest.Mock;
    render(<FriendsPanel localUser={baseLocalUser()} />);

    await userEvent.type(
      screen.getByPlaceholderText("Friend's friendship key"),
      "bob-uuid",
    );
    await userEvent.click(screen.getByText("Send"));

    await waitFor(() =>
      expect(screen.getByText("bob-uuid")).toBeInTheDocument(),
    );
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("/friendships");
    expect(options.method).toBe("POST");
  });

  test("accepting an incoming invite moves it into the friends list", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(jsonResponse(true)),
    ) as jest.Mock;
    const localUser = baseLocalUser({
      pending_friendship_invitations: [
        { uuid: "carol-uuid", name: "Carol", email: "carol@example.com" },
      ],
    });
    render(<FriendsPanel localUser={localUser} />);

    await userEvent.click(screen.getByText("Accept"));

    await waitFor(() =>
      expect(
        screen.getByText(/Carol \(carol@example.com\)/),
      ).toBeInTheDocument(),
    );
  });

  test("accepting a trip invitation PATCHes trip_memberships and removes it from the list", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(jsonResponse(true)),
    ) as jest.Mock;
    const localUser = baseLocalUser({
      pending_trip_invitations: [
        {
          id: 42,
          trip: { id: 5, name: "Alpine Traverse" },
          issuer: { name: "Alice" },
        },
      ],
    });
    render(<FriendsPanel localUser={localUser} />);

    await userEvent.click(screen.getByText("Accept", { exact: true }));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/v1/trip_memberships/42",
        expect.objectContaining({ method: "PATCH" }),
      ),
    );
    await waitFor(() =>
      expect(
        screen.getByText("No pending trip invitations."),
      ).toBeInTheDocument(),
    );
  });

  test("typing a search query finds discoverable users", async () => {
    global.fetch = jest.fn((url: string) => {
      if (url.startsWith("/api/v1/users/search")) {
        return Promise.resolve(
          jsonResponse(true, [{ uuid: "carol-uuid", name: "Carol", id: 3 }]),
        );
      }
      return Promise.resolve(jsonResponse(true));
    }) as jest.Mock;
    render(<FriendsPanel localUser={baseLocalUser()} />);

    await userEvent.type(
      screen.getByPlaceholderText("Search by name or email…"),
      "carol",
    );

    await waitFor(() => expect(screen.getByText("Carol")).toBeInTheDocument(), {
      timeout: 2000,
    });
    expect(global.fetch).toHaveBeenCalledWith("/api/v1/users/search?q=carol");
  });

  test("sending a request from search results POSTs a friendship and marks it sent", async () => {
    global.fetch = jest.fn((url: string) => {
      if (url.startsWith("/api/v1/users/search")) {
        return Promise.resolve(
          jsonResponse(true, [{ uuid: "carol-uuid", name: "Carol", id: 3 }]),
        );
      }
      return Promise.resolve(jsonResponse(true));
    }) as jest.Mock;
    render(<FriendsPanel localUser={baseLocalUser()} />);

    await userEvent.type(
      screen.getByPlaceholderText("Search by name or email…"),
      "carol",
    );
    await waitFor(() => expect(screen.getByText("Carol")).toBeInTheDocument(), {
      timeout: 2000,
    });

    await userEvent.click(screen.getByText("Send Request"));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        "/friendships",
        expect.objectContaining({ method: "POST" }),
      ),
    );
    await waitFor(() => expect(screen.getByText("Sent")).toBeInTheDocument());
  });
});
