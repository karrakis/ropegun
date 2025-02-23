import React, { useState } from "react";
import { csrfToken } from "../../../utilities/csrfToken";
import classNames from "classnames";

import MapControl from "../../Map/MapControl";
import LocationsSelector from "../Locations/Selector";

import { TripEditProps } from "../../types";

export const TripEdit = ({
  trip,
  updateTrip,
  setTrip,
  trips,
  position,
  updatePosition,
  handleWeatherSelection,
  localUser,
}: TripEditProps) => {
  //friends selected in the dropdown for invitations.
  const [openMap, updateOpenMap] = useState(false);

  console.log("trip:", trip);
  console.log("trips:", trips);

  return (
    <>
      <div className="flex flex-col justify-start items-center h-fit w-full bg-night text-cream max-w-3xl z-10 pt-2">
        {trips.length > 0 && (
          <select
            className="w-fit p-2 bg-auburn text-cream rounded-md mb-2"
            onChange={(e) => {
              //one of these is probably a string, the other an integer and we're using ===
              const trip = trips.filter(
                (trip) => trip.id === parseInt(e.target.value)
              )[0];

              console.log("xxx:", trip);
              setTrip({
                id: trip.id,
                name: trip.name,
                locations: trip.locations.map((loc) => ({
                  id: loc.id,
                  name: loc.name,
                  office: loc.office,
                  office_x: loc.office_x,
                  office_y: loc.office_y,
                  latitude: loc.latitude,
                  longitude: loc.longitude
                })),
                owner: trip.owner,
              });
            }}
            value={trip.id}
          >
            {trips.map((tripSelect) => {
              return (
                <option key={tripSelect.id} value={tripSelect.id}>
                  {tripSelect.name}
                </option>
              );
            })}
          </select>
        )}
        <div className="flex flex-col items-center p-2 w-full">
          <div
            className="text-cream w-full p-2 bg-auburn text-center cursor-pointer"
            onClick={() => updateOpenMap(!openMap)}
          >
            {openMap ? "Close Map" : "Add Locations to Trip"}
          </div>
        </div>
        {openMap && (
          <MapControl
            {...{
              position,
              updatePosition,
              weatherTargets: trip.locations,
              updateWeatherTargets: handleWeatherSelection,
              trip,
              updateTrip,
              localUser,
            }}
          />
        )}
      </div>
      <LocationsSelector
        trip={trip}
        updateTrip={updateTrip}
      />
    </>
  );
};

export default TripEdit;
