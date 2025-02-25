import React from "react";
import {
  AreaChart,
  Line,
  XAxis,
  YAxis,
  Area,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";

import CustomTooltip from "./CustomTooltipTemperature";

const colorsGoodOnWhite = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8e29",
  "#ff7300",
  "#ff4d00",
  "#ff0000",
]

const generateRandomColor = () => {
  // return "#000000".replace(/0/g, function () {
  //   return (~~(Math.random() * 16)).toString(16);
  // });

  return colorsGoodOnWhite[Math.floor(Math.random() * colorsGoodOnWhite.length)];
};

const generateAreas = (data) => {
  return data.map((weather) => {
    const placeName = Object.keys(weather[0])[1];
    const color = generateRandomColor();
    return (
      <Area
        key={placeName}
        type="monotone"
        dataKey={placeName}
        stroke={color}
        fill={color}
        activeDot={{ r: 8 }}
      />
    );
  });
};

export const AreaGraph = ({ data }) => {
  const listData = {};
  data.forEach((place) => {
    place.forEach((day) => {
      listData[day.day] ||= {};
      Object.entries(day).forEach(([key, value]) => {
        if (key !== "day") {
          listData[day.day][key] = value;
        }
      });
    });
  });

  const list = Object.entries(listData).map((day) => {
    return { day: day[0].slice(5, 10), ...day[1] };
  });

  return (
    <>
      <h3 className="text-center text-cream">Temperature</h3>
      <ResponsiveContainer width="100%" height={300} className={"pb-4"}>
        <AreaChart
          width={500}
          height={300}
          data={list}
          margin={{
            top: 5,
            right: 30,
            bottom: 5,
            left: 20,
          }}
        >
          <XAxis dataKey="day"/>
          <YAxis>
            <Label
              value="Temperature (F)"
              angle={-90}
              position="insideLeft"
              style={{ textAnchor: "middle", color: "cream", marginTop: "20px" }}/>
          </YAxis>
          <Tooltip content={<CustomTooltip payload={data}/>}/>
          {generateAreas(data)}
        </AreaChart>
      </ResponsiveContainer>
    </>
  );
};

export default AreaGraph;
