import React from "react";
import { render, screen } from "@testing-library/react";
import { AppRoot } from "./AppRoot";

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
      />
    );

    // Assert that the Dashboard component is rendered
    expect(screen.getByText("Plan a Trip")).toBeInTheDocument();
  });

  it("renders the ComingSoon component when localUser.id is not defined", () => {
    render(
      <AppRoot
        routes={routes}
        user={user}
        localUser={{}}
        csrf={csrf}
        userSavedLocations={userSavedLocations}
      />
    );

    // Assert that the ComingSoon component is rendered
    expect(screen.getByText("Arriving Soonish")).toBeInTheDocument();
  });

  // Add more test cases as needed
});