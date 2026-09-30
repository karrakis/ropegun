import React from "react";
import { render, screen } from "@testing-library/react";
import { HeaderLeft } from "./HeaderLeft";

describe("HeaderLeft", () => {
  test("no longer shows an App Roadmap link", () => {
    render(<HeaderLeft page="/trip_plan" setPage={jest.fn()} />);
    expect(screen.queryByText("App Roadmap")).not.toBeInTheDocument();
  });

  test("the Feedback link carries the current page as return_to", () => {
    render(<HeaderLeft page="/dashboard" setPage={jest.fn()} />);
    const links = screen.getAllByText("Feedback").map((el) => el.closest("a"));
    expect(links[0]).toHaveAttribute(
      "href",
      "/feedbacks/new?return_to=%2Fdashboard",
    );
  });
});
