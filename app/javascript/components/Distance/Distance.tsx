import React, { useState, useEffect } from "react";
import { asynchronousStateUpdate } from "../../utilities/asynchronousStateUpdate";
import { getDistances } from "../../utilities/getDistances";

export const Distance = ({ locations, localUser }) => {
  const [distances, updateDistances] = useState({});
  const [distancesReady, updateDistancesReady] = useState(false);

  useEffect(() => {
    const locationUpdates = getDistances(locations, localUser);
    asynchronousStateUpdate(locationUpdates, updateDistances);
  }, [locations]);

  useEffect(() => {
    if (distances && Object.keys(distances).length > 0) {
      if (distances[Object.keys(distances)[0]].distance) {
        updateDistancesReady(true);
      }
    }
  }, [distances]);

  const displayDistances = () => {
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
                      distances[destination].distance.rows[0].elements[0]
                        .distance.text
                    }
                  </td>
                  <td className="border-b border-l border-r border-auburn p-1">
                    {
                      distances[destination].distance.rows[0].elements[0]
                        .duration.text
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

  return (
    <div className="w-full">
      <h1 className="w-full text-cream bg-night text-xl p-2 text-center rounded-t-md">
        Distances
      </h1>
      {distancesReady && displayDistances()}
    </div>
  );
};

export default Distance;
