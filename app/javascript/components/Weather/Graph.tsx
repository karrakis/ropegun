import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const generateRandomColor = () => {
  return "#000000".replace(/0/g, function () {
    return (~~(Math.random() * 16)).toString(16);
  });
};

const generateLines = (data) => {
  console.log(data);
  return Object.keys(data[0]).map((key) => {
    if (key === "name") return;
    return (
      <Line
        type="monotone"
        dataKey={key}
        stroke={generateRandomColor()}
        activeDot={{ r: 8 }}
      />
    );
  });
};

export const Graph = ({ data }) => {
  return (
    <>
      <h3 className="text-center text-cream">Precipitation</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          {generateLines(data)}
        </LineChart>
      </ResponsiveContainer>
    </>
  );
};

export default Graph;
