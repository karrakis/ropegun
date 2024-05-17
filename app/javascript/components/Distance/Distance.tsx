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
      <table className="mb-16">
        <thead>
          <tr>
            <th>Destination</th>
            <th>Distance from organizer</th>
            <th>Estimated Drive Time</th>
          </tr>
        </thead>
        {Object.keys(distances).map((destination) => {
          if (distances[destination].distance) {
            return (
              <tr>
                <td>{destination}</td>
                <td>
                  {
                    distances[destination].distance.rows[0].elements[0].distance
                      .text
                  }
                </td>
                <td>
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
    <div>
      <h1>Distance</h1>
      {distancesReady && displayDistances()}
    </div>
  );
};

export default Distance;
