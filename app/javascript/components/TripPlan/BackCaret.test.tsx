import React from "react";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { BackCaret } from "./BackCaret";

describe("BackCaret", () => {
  test("renders a single thumb-friendly back control and fires onClick", async () => {
    const onClick = jest.fn();
    render(<BackCaret onClick={onClick} />);

    const button = screen.getByRole("button", { name: "Back" });
    expect(button).toBeInTheDocument();

    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("accepts a custom aria-label", () => {
    render(<BackCaret onClick={jest.fn()} label="Back to your trips" />);
    expect(
      screen.getByRole("button", { name: "Back to your trips" }),
    ).toBeInTheDocument();
  });
});
