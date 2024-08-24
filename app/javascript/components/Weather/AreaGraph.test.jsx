import React from "react";
import { render } from "@testing-library/react";
import AreaGraph from "./AreaGraph";


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

describe("AreaGraph", () => {
  const data = [
    [
      { day: "2022-01-01", place1: 10, place2: 20 },
      { day: "2022-01-02", place1: 15, place2: 25 },
      { day: "2022-01-03", place1: 12, place2: 22 },
    ],
  ];

  it("renders without errors", () => {
    render(<AreaGraph data={data} />);
  });

  // Add more test cases as needed
});