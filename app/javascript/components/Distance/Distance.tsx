import React, { useState, useEffect } from "react";
import { asynchronousStateUpdate } from "../../utilities/asynchronousStateUpdate";
import { getDistances } from "../../utilities/getDistances";

import { AverageDistances } from "./AverageDistances";

export const displayDistances = (distances) => {
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

export const Distance = ({ locations, localUser, trip = nil }) => {
  const [distances, updateDistances] = useState({});
  const [guestDistances, updateGuestDistances] = useState([]);
  const [distancesReady, updateDistancesReady] = useState(false);

  console.log("guestDistances:", guestDistances);

  useEffect(() => {
    const locationUpdates = getDistances(locations, localUser);
    asynchronousStateUpdate(locationUpdates, updateDistances);
  }, [locations]);

  useEffect(() => {
    console.log("in the effect");
    const results = trip.trip_invitations
      .filter((invitation) => invitation.accepted == true)
      .map(async (invitation) => {
        const locationUpdates = getDistances(locations, invitation.invitee);
        console.log("locationUpdates:", locationUpdates);
        const resolutions = locationUpdates.then((toBeResolved) => {
          let updatesResolved = Promise.all(toBeResolved).then((data) => {
            return data.map((update) => {
              return {
                [update.name]: update.data,
              };
            });
          });

          return updatesResolved;
        });
        return {
          label: `${invitation.invitee.name} (${invitation.invitee.email})`,
          distances: resolutions,
        };
      });
    console.log("results", results);
    Promise.all(results).then((data) => {
      console.log("data", data);
      data.map((datum) => {
        console.log("datum:", datum);
        datum.distances.then((resolved) => {
          console.log("resolved:", resolved);
          updateGuestDistances((prev) => {
            return [...prev, { label: datum.label, distances: resolved }];
          });
        });
      });
    });
  }, [
    trip.trip_invitations
      .filter((invitation) => invitation.accepted == true)
      .map((invitation) => invitation.invitee.uuid).length,
  ]);

  useEffect(() => {
    if (distances && Object.keys(distances).length > 0) {
      if (distances[Object.keys(distances)[0]].distance) {
        updateDistancesReady(true);
      }
    }
  }, [distances]);

  useEffect(() => {
    if (guestDistances && Object.keys(guestDistances).length > 0) {
      if (guestDistances[Object.keys(guestDistances)[0]].distance) {
        updateDistancesReady(true);
      }
    }
  }, [guestDistances]);

  return (
    <div className="w-full">
      <h1 className="w-full text-cream bg-night text-xl p-2 text-center rounded-t-md">
        Average Distances
      </h1>
      {distancesReady && (
        <AverageDistances
          distances={distances}
          guestDistances={guestDistances}
        />
      )}
      <h1 className="w-full text-cream bg-night text-xl p-2 text-center rounded-t-md">
        Organizer Distances
      </h1>
      {distancesReady && displayDistances(distances)}
      <h1 className="w-full text-cream bg-night text-xl p-2 text-center rounded-t-md mt-2">
        Invitee Distances
      </h1>
      {guestDistances.map((guest) => {
        return (
          <div key={guest.label} className="w-full">
            <h2 className="w-full text-cream bg-night text-lg p-2 text-center rounded-t-md">
              {guest.label}
            </h2>
            {displayDistances(Object.assign({}, ...guest.distances))}
          </div>
        );
      })}
    </div>
  );
};

export default Distance;
