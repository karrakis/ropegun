import React, { useState, useEffect } from "react";
import { asynchronousStateUpdate } from "../../utilities/asynchronousStateUpdate";
import { getDistances } from "../../utilities/getDistances";
import { TripInvitation, DistanceProps } from "../types";

import AverageDistances from "./AverageDistances";
import DisplayDistances from "./DisplayDistances";

export const Distance = ({ locations, tripOwner, trip }: DistanceProps) => {
  const [ownerDistances, updateOwnerDistances] = useState({});
  const [guestDistances, updateGuestDistances] = useState([]);
  const [distancesReady, updateDistancesReady] = useState(false);

  useEffect(() => {
    const locationUpdates = getDistances(locations, tripOwner);
    asynchronousStateUpdate(locationUpdates, updateOwnerDistances);
  }, [locations]);

  useEffect(() => {
    if (trip?.trip_invitations && trip.trip_invitations?.length > 0) {
      const results = trip.trip_invitations
        .filter((invitation: TripInvitation) => invitation.accepted == true)
        .map(async (invitation: TripInvitation) => {
          const locationUpdates = getDistances(locations, invitation.invitee);
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
      Promise.all(results).then((data) => {
        data.map((datum) => {
          datum.distances.then((resolved) => {
            updateGuestDistances((prev) => {
              return [...prev, { label: datum.label, distances: resolved }];
            });
          });
        });
      });
    }
  }, [
    trip?.trip_invitations
      ?.filter((invitation) => invitation.accepted == true)
      ?.map((invitation) => invitation.invitee.uuid).length,
  ]);

  useEffect(() => {
    if (ownerDistances && Object.keys(ownerDistances).length > 0) {
      if (ownerDistances[Object.keys(ownerDistances)[0]].distance) {
        updateDistancesReady(true);
      }
    }
  }, [ownerDistances]);

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
          distances={ownerDistances}
          guestDistances={guestDistances}
        />
      )}
      <h1 className="w-full text-cream bg-night text-xl p-2 text-center rounded-t-md">
        Organizer Distances
      </h1>
      {distancesReady && <DisplayDistances distances={ownerDistances} />}
      <h1 className="w-full text-cream bg-night text-xl p-2 text-center rounded-t-md mt-2">
        Invitee Distances
      </h1>
      {guestDistances.map((guest) => {
        return (
          <div key={guest.label} className="w-full">
            <h2 className="w-full text-cream bg-night text-lg p-2 text-center rounded-t-md">
              {guest.label}
            </h2>
            <DisplayDistances
              distances={Object.assign({}, ...guest.distances)}
            />
          </div>
        );
      })}
    </div>
  );
};

export default Distance;
