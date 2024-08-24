import React from "react";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import GraphSwitcher from "./GraphSwitcher";

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

describe("GraphSwitcher", () => {
  const weatherData = {
    place1: {
      periods: [
        {
          endTime: "2022-01-01T12:00:00Z",
          startTime: "2022-01-01T00:00:00Z",
          temperature: 20,
          probabilityOfPrecipitation: {
            value: 0.3,
          },
        },
        // Add more sample data as needed
      ],
    },
    // Add more sample data as needed
  };

  test("renders temperature graph when weatherDisplay is 'temperature'", () => {
    render(<GraphSwitcher weather={weatherData} />);
    const temperatureGraph = screen.getByRole("heading", { name: "Temperature" });
    expect(temperatureGraph).toBeInTheDocument();
  });

  test("renders precipitation graph when weatherDisplay is 'precipitation'", async () => {
    render(<GraphSwitcher weather={weatherData} />);
    await userEvent.click(screen.getByRole("button", { name: "Precipitation" }));
    const precipitationGraph = screen.getByRole("heading", { name: "Precipitation" });
    expect(precipitationGraph).toBeInTheDocument();
  });

  // Add more tests as needed
});