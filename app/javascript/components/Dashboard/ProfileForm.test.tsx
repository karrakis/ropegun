import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ProfileForm } from "./ProfileForm";

describe("ProfileForm", () => {
  const user = { given_name: "Alice", family_name: "Climbington", picture: "" };

  const baseLocalUser = (overrides: Partial<any> = {}) => ({
    id: 1,
    uuid: "abc-123",
    email: "alice@example.com",
    home_address: "",
    about_me: "",
    additional_information: "",
    profile_visibility: {},
    ...overrides,
  });

  beforeEach(() => {
    document.head.innerHTML = '<meta name="csrf-token" content="test-token">';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("starts in read-only mode and shows an Edit button", () => {
    render(
      <ProfileForm
        user={user}
        localUser={baseLocalUser({ about_me: "I climb" })}
        onSaved={jest.fn()}
      />,
    );
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.queryByLabelText("About Me")).not.toBeInTheDocument();
    expect(screen.getByText("I climb")).toBeInTheDocument();
  });

  test("read-only mode shows whether the profile is discoverable by search", () => {
    render(
      <ProfileForm
        user={user}
        localUser={baseLocalUser({ discoverable_by_search: true })}
        onSaved={jest.fn()}
      />,
    );
    expect(screen.getByText("Discoverable by search")).toBeInTheDocument();
    expect(screen.getByText("Yes")).toBeInTheDocument();
  });

  test("defaults visibility selects to the field defaults when unset", async () => {
    render(
      <ProfileForm
        user={user}
        localUser={baseLocalUser()}
        onSaved={jest.fn()}
      />,
    );
    await userEvent.click(screen.getByText("Edit"));
    expect(screen.getByLabelText("email visibility")).toHaveValue("friends");
    expect(screen.getByLabelText("home_address visibility")).toHaveValue(
      "app_only",
    );
    expect(screen.getByLabelText("about_me visibility")).toHaveValue("public");
    expect(
      screen.getByLabelText("additional_information visibility"),
    ).toHaveValue("friends");
  });

  test("saving PATCHes edited fields and the updated visibility map, calls onSaved, and exits edit mode", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ about_me: "I climb" }),
      }),
    ) as jest.Mock;
    const onSaved = jest.fn();
    render(
      <ProfileForm user={user} localUser={baseLocalUser()} onSaved={onSaved} />,
    );

    await userEvent.click(screen.getByText("Edit"));
    await userEvent.type(screen.getByLabelText("About Me"), "I climb");
    await userEvent.selectOptions(
      screen.getByLabelText("home_address visibility"),
      "friends",
    );
    await userEvent.click(screen.getByText("Save"));

    await waitFor(() =>
      expect(onSaved).toHaveBeenCalledWith({ about_me: "I climb" }),
    );
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("/users/1");
    expect(options.method).toBe("PATCH");
    const body = JSON.parse(options.body);
    expect(body.user.about_me).toBe("I climb");
    expect(body.user.profile_visibility.home_address).toBe("friends");

    // Edit mode should be exited on a successful save — no more form fields,
    // Edit button is back.
    await waitFor(() => expect(screen.getByText("Edit")).toBeInTheDocument());
    expect(screen.queryByLabelText("About Me")).not.toBeInTheDocument();
  });

  test("toggling the discoverable-by-search checkbox includes it in the save payload", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ discoverable_by_search: true }),
      }),
    ) as jest.Mock;
    render(
      <ProfileForm
        user={user}
        localUser={baseLocalUser()}
        onSaved={jest.fn()}
      />,
    );

    await userEvent.click(screen.getByText("Edit"));
    await userEvent.click(
      screen.getByLabelText(
        "Let other users find me by name or email in friend search",
      ),
    );
    await userEvent.click(screen.getByText("Save"));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.user.discoverable_by_search).toBe(true);
  });

  test("cancel exits edit mode without saving", async () => {
    render(
      <ProfileForm
        user={user}
        localUser={baseLocalUser({ about_me: "original" })}
        onSaved={jest.fn()}
      />,
    );

    await userEvent.click(screen.getByText("Edit"));
    await userEvent.clear(screen.getByLabelText("About Me"));
    await userEvent.type(screen.getByLabelText("About Me"), "throwaway edit");
    await userEvent.click(screen.getByText("Cancel"));

    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("original")).toBeInTheDocument();
    expect(screen.queryByText("throwaway edit")).not.toBeInTheDocument();
  });

  test("shows an error, does not call onSaved, and stays in edit mode when the server rejects the update", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: async () => ({ about_me: ["is too long"] }),
      }),
    ) as jest.Mock;
    const onSaved = jest.fn();
    render(
      <ProfileForm user={user} localUser={baseLocalUser()} onSaved={onSaved} />,
    );

    await userEvent.click(screen.getByText("Edit"));
    await userEvent.click(screen.getByText("Save"));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("is too long"),
    );
    expect(onSaved).not.toHaveBeenCalled();
    expect(screen.getByLabelText("About Me")).toBeInTheDocument();
  });

  test("shows an error when the request itself fails", async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error("network down")),
    ) as jest.Mock;
    render(
      <ProfileForm
        user={user}
        localUser={baseLocalUser()}
        onSaved={jest.fn()}
      />,
    );

    await userEvent.click(screen.getByText("Edit"));
    await userEvent.click(screen.getByText("Save"));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Could not reach the server",
      ),
    );
  });
});
