import React, { useState, useEffect } from "react";
import { asynchronousStateUpdate } from "../../utilities/asynchronousStateUpdate";
import { getDistances } from "../../utilities/getDistances";

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
        return resolutions;
      });
    console.log("results", results);
    Promise.all(results).then((data) => {
      console.log("data", data);
      updateGuestDistances(data);
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
