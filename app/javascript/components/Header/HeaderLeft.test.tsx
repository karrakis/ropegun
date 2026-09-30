import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { HeaderLeft } from "./HeaderLeft";

describe("HeaderLeft", () => {
  test("no longer shows an App Roadmap link", () => {
    render(<HeaderLeft page="/trip_plan" setPage={jest.fn()} />);
    expect(screen.queryByText("App Roadmap")).not.toBeInTheDocument();
  });

  test("clicking Feedback opens the feedback modal instead of navigating", () => {
    render(<HeaderLeft page="/dashboard" setPage={jest.fn()} />);
    expect(
      screen.queryByText("What's on your mind?"),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByText("Feedback")[0]);

    expect(screen.getByText("What's on your mind?")).toBeInTheDocument();
  });
});
