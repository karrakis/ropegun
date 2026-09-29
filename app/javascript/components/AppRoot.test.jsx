import React from "react";
import { render, screen } from "@testing-library/react";
import { AppRoot } from "./AppRoot";

// AppRoot subscribes to FriendshipsChannel (via getConsumer) whenever a
// logged-in localUser is present, so it can push friendship updates into
// state without a page reload. Mock it out here — jsdom has no real
// ActionCable server to connect to, and the tests below don't exercise
// live updates (see FriendsPanel.test.tsx for that).
jest.mock("../utilities/cable", () => ({
  getConsumer: () => ({
    subscriptions: {
      create: () => ({ unsubscribe: () => {} }),
    },
  }),
}));

describe("AppRoot", () => {
  const routes = {
    dashboard: {
      path: "/dashboard",
      name: "Dashboard",
    },
  };

  const user = {
    name: "John Doe",
    picture: "https://example.com/johndoe.jpg",
  };

  const localUser = {
    id: 123,
    pending_friendship_invitations: [],
    pending_friend_requests: [],
  };

  const csrf = "abc123";

  const userSavedLocations = {
    // mock user saved locations
  };

  it("renders the correct page based on the current path", () => {
    // Mock window.location.pathname
    delete window.location;
    window.location = {
      pathname: "/dashboard",
    };

    render(
      <AppRoot
        routes={routes}
        user={user}
        localUser={localUser}
        csrf={csrf}
        userSavedLocations={userSavedLocations}
      />,
    );

    // Assert that the Dashboard component is rendered
    expect(screen.getByText("Plan a Trip")).toBeInTheDocument();
  });

  it("renders the Landing component when localUser.id is not defined", () => {
    render(
      <AppRoot
        routes={routes}
        user={user}
        localUser={{}}
        csrf={csrf}
        userSavedLocations={userSavedLocations}
      />,
    );

    // Assert that the Landing component is rendered
    expect(screen.getByText("Going Somewhere?")).toBeInTheDocument();
  });

  // Add more test cases as needed
});
