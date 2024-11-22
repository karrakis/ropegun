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

const generateRandomColor = () => {
  return "#000000".replace(/0/g, function () {
    return (~~(Math.random() * 16)).toString(16);
  });
};

const generateAreas = (data) => {
  return data.map((weather) => {
    const placeName = Object.keys(weather[0])[1];
    return (
      <Area
        key={placeName}
        type="monotone"
        dataKey={placeName}
        stroke={generateRandomColor()}
        fill={generateRandomColor()}
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
          <Tooltip />
          {generateAreas(data)}
        </AreaChart>
      </ResponsiveContainer>
    </>
  );
};

export default AreaGraph;
