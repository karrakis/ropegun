import React from "react";
import { render, screen } from "@testing-library/react";
import { GuestInfoModal } from "./GuestInfoModal";

describe("GuestInfoModal", () => {
  test("renders nothing when guest is null", () => {
    render(<GuestInfoModal guest={null} onClose={jest.fn()} />);
    expect(screen.queryByText("Close")).not.toBeInTheDocument();
  });

  test("renders the guest's name and email when both are present", () => {
    render(
      <GuestInfoModal
        guest={{ name: "Casey", email: "casey@example.com" }}
        onClose={jest.fn()}
      />,
    );
    expect(screen.getByText("Casey")).toBeInTheDocument();
    expect(screen.getByText("casey@example.com")).toBeInTheDocument();
  });

  test("omits the email row when the guest didn't provide one", () => {
    render(<GuestInfoModal guest={{ name: "Casey" }} onClose={jest.fn()} />);
    expect(screen.queryByText("Email")).not.toBeInTheDocument();
  });

  test("calls onClose when the Close button is clicked", () => {
    const onClose = jest.fn();
    render(<GuestInfoModal guest={{ name: "Casey" }} onClose={onClose} />);
    screen.getByText("Close").click();
    expect(onClose).toHaveBeenCalled();
  });
});
