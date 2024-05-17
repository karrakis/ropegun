import React, { useState, useEffect } from "react";

export const Distance = ({ locations, localUser }) => {
  const [distances, updateDistances] = useState({});
  const [distancesReady, updateDistancesReady] = useState(false);

  useEffect(() => {
    console.log("useEffect running");
    console.log(locations);
    const csrfElement: HTMLElement | null = document.querySelector(
      '[name="csrf-token"]'
    );
    const csrfToken =
      csrfElement instanceof HTMLMetaElement ? csrfElement.content : "";
    const locationUpdates = locations.map(async (loc) => {
      const origin = localUser.home_address;
      if (!origin) return;
      const destination = loc.location;
      const label = loc.name;

      let response = await fetch("/api/v1/distance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          origin,
          destination,
        }),
      });

      let data = await response.json();
      return { name: loc.name, data: data };
    });

    let locationUpdatesResolved = Promise.all(locationUpdates).then((data) => {
      return data.map((loc) => {
        return {
          [loc.name]: loc.data,
        };
      });
    });
    locationUpdatesResolved.then((distancesToAdd) => {
      updateDistances(Object.assign({}, ...distancesToAdd));
    });
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
      <h1 className="w-full text-cream bg-night mt-2 text-xl p-2 text-center rounded-t-md">
        Distances
      </h1>
      {distancesReady && displayDistances()}
    </div>
  );
};

export default Distance;
