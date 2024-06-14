import React from "react";

export const DisplayDistances = ({ distances }) => {
  console.log("distances:", distances);
  return (
    <table className="bg-night text-cream w-full">
      <thead className="border border-auburn w-full">
        <tr>
          <th className="border-b border-l border-r border-auburn p-1">
            Destination
          </th>
          <th className="border-b border-l border-r border-auburn p-1">
            Miles
          </th>
          <th className="border-b border-l border-r border-auburn p-1">
            Drive Time
          </th>
        </tr>
      </thead>
      <tbody>
        {Object.keys(distances).map((destination) => {
          if (distances[destination].distance) {
            return (
              <tr key={`${destination}-distance`}>
                <td className="border-b border-l border-r border-auburn p-1">
                  {destination}
                </td>
                <td className="border-b border-l border-r border-auburn p-1">
                  {
                    distances[destination].distance.rows[0].elements[0].distance
                      .text
                  }
                </td>
                <td className="border-b border-l border-r border-auburn p-1">
                  {
                    distances[destination].distance.rows[0].elements[0].duration
                      .text
                  }
                </td>
              </tr>
            );
          }
        })}
      </tbody>
    </table>
  );
};

export default DisplayDistances;
