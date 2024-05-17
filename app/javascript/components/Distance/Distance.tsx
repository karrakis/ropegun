import React, { useState, useEffect } from "react";

export const Distance = ({ locations, localUser }) => {
  const [distances, updateDistances] = useState({});
  const [distancesReady, updateDistancesReady] = useState(false);
  const fetchDistanceFromGoogleAPI = async (origin, destination, label) => {
    const csrfElement: HTMLElement | null = document.querySelector(
      '[name="csrf-token"]'
    );
    const csrfToken =
      csrfElement instanceof HTMLMetaElement ? csrfElement.content : "";
    fetch("/api/v1/distance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify({
        origin,
        destination,
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        updateDistances({ ...distances, [label]: data });
      });
  };

  const handleDistanceSelection = async (loc) => {
    console.log("handleDistanceSelection");
    const origin = localUser.home_address;
    if (!origin) return;
    console.log("origin", origin);
    console.log("loc", loc);
    const destination = loc.location;
    const label = loc.name;
    const distance = fetchDistanceFromGoogleAPI(origin, destination, label);
    updateDistances({ ...distances, [loc.name]: distance });
  };

  useEffect(() => {
    console.log("useEffect running");
    locations.forEach((loc) => {
      handleDistanceSelection(loc);
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
        {Object.keys(distances).map((destination) => {
          if (distances[destination].distance) {
            return (
              <tr>
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
