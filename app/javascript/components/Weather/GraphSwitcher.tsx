import React, { useState } from "react";

import Graph from "./Graph";
import AreaGraph from "./AreaGraph";

const GraphSwitcher = ({ weather }) => {
  const [weatherDisplay, updateWeatherDisplay] = useState("temperature");

  const weatherDataTemperature = Object.keys(weather).map((placeName) => {
    const days = weather[placeName].periods
      .map((p) => p.endTime.slice(0, 10))
      .filter((el, i, arr) => arr.indexOf(el) === i);
    return days.map((day) => {
      const periods = weather[placeName].periods.filter(
        (p) =>
          p.endTime.slice(0, 10) === day || p.startTime.slice(0, 10) === day
      );
      const temperatures = periods.map((p) => p.temperature).sort();
      const temperatureOutput = [
        temperatures[0],
        temperatures[temperatures.length - 1],
      ];
      return {
        day,
        [placeName]: temperatureOutput,
      };
    });
  });

  const weatherDataPrecipitation: Object[] = [];
  const weatherDataRaw = Object.keys(weather).map((placeName) => {
    return weather[placeName].periods.map((p) =>
      Object.assign(
        {},
        { name: p.name, [placeName]: p.probabilityOfPrecipitation.value || 0 }
      )
    );
  });

  weatherDataRaw.forEach((list) => {
    list.forEach((item, i) => {
      weatherDataPrecipitation[i] ||= {};
      weatherDataPrecipitation[i] = Object.assign(
        {},
        weatherDataPrecipitation[i],
        item
      );
    });
  });

  console.log(weatherDataTemperature.length);
  console.log(weatherDataPrecipitation.length);
  return (
    <>
      <div className="bg-night w-full text-cream text-center pt-12">
        {weatherDataTemperature.length > 0 &&
          weatherDisplay == "temperature" && (
            <AreaGraph data={weatherDataTemperature} />
          )}
        {weatherDataPrecipitation.length > 0 &&
          weatherDisplay == "precipitation" && (
            <Graph data={weatherDataPrecipitation} />
          )}
      </div>
      <div className="flex flex-row justify-center w-full">
        <div
          className={`w-1/2 h-full flex justify-center items-center cursor-pointer ${
            weatherDisplay === "temperature" ? "bg-night" : "bg-auburn"
          } text-cream`}
          onClick={() => updateWeatherDisplay("temperature")}
          role="button"
        >
          Temperature
        </div>
        <div
          className={`w-1/2 h-full flex justify-center items-center cursor-pointer ${
            weatherDisplay === "precipitation"
              ? "bg-night"
              : "bg-khaki text-night"
          } text-cream`}
          onClick={() => updateWeatherDisplay("precipitation")}
          role="button"
        >
          Precipitation
        </div>
      </div>
    </>
  );
};

export default GraphSwitcher;
