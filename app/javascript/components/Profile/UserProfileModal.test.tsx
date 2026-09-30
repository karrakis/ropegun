import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { UserProfileModal } from "./UserProfileModal";

describe("UserProfileModal", () => {
  const jsonResponse = (ok = true, body: any = {}) => ({
    ok,
    json: async () => body,
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renders nothing when uuid is null", () => {
    render(<UserProfileModal uuid={null} onClose={jest.fn()} />);
    expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
  });

  test("fetches and displays the profile for the given uuid", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(
        jsonResponse(true, {
          id: 2,
          uuid: "bob-uuid",
          name: "Bob Belayer",
          about_me: "I like long belays",
        }),
      ),
    ) as jest.Mock;

    render(<UserProfileModal uuid="bob-uuid" onClose={jest.fn()} />);

    expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe(
      "/api/v1/users/bob-uuid",
    );
    await waitFor(() =>
      expect(screen.getByText("Bob Belayer")).toBeInTheDocument(),
    );
    expect(screen.getByText("I like long belays")).toBeInTheDocument();
  });

  test("omits fields the server didn't include (hidden by visibility)", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(
        jsonResponse(true, { id: 2, uuid: "bob-uuid", name: "Bob Belayer" }),
      ),
    ) as jest.Mock;

    render(<UserProfileModal uuid="bob-uuid" onClose={jest.fn()} />);

    await waitFor(() =>
      expect(screen.getByText("Bob Belayer")).toBeInTheDocument(),
    );
    expect(screen.queryByText("About Me")).not.toBeInTheDocument();
    expect(screen.queryByText("Email")).not.toBeInTheDocument();
  });

  test("shows an error message if the fetch fails", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(jsonResponse(false)),
    ) as jest.Mock;

    render(<UserProfileModal uuid="bob-uuid" onClose={jest.fn()} />);

    await waitFor(() =>
      expect(
        screen.getByText("Could not load this profile."),
      ).toBeInTheDocument(),
    );
  });

  test("calls onClose when the Close button is clicked", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(
        jsonResponse(true, { id: 2, uuid: "bob-uuid", name: "Bob Belayer" }),
      ),
    ) as jest.Mock;
    const onClose = jest.fn();

    render(<UserProfileModal uuid="bob-uuid" onClose={onClose} />);

    await waitFor(() =>
      expect(screen.getByText("Bob Belayer")).toBeInTheDocument(),
    );
    screen.getByText("Close").click();
    expect(onClose).toHaveBeenCalled();
  });
});
