import React from "react";
import { render } from "@testing-library/react";
import Graph from "./Graph";

global.ResizeObserver = require("resize-observer-polyfill");


jest.mock("recharts", () => {
  const OriginalModule = jest.requireActual("recharts");
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }) => (
      <OriginalModule.ResponsiveContainer width={800} height={800}>
        {children}
      </OriginalModule.ResponsiveContainer>
    ),
  };
});

describe("Graph", () => {
  const data = [
    { name: "A", value1: 10, value2: 20 },
    { name: "B", value1: 15, value2: 25 },
    { name: "C", value1: 20, value2: 30 },
  ];

  it("renders without errors", () => {
    render(<Graph data={data} />);
  });

  it("renders the correct number of lines", () => {
    const { container } = render(<Graph data={data} />);
    const lines = container.querySelectorAll(".recharts-line");

    expect(lines.length).toBe(Object.keys(data[0]).length - 1);
  });

  // Add more tests as needed

});