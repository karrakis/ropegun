import React from "react";
import { csrfToken } from "../../utilities/csrfToken";
import classNames from "classnames";

import MapControl from "../../Map/MapControl";

export const TripEdit = ({
  trip,
  updateTrip,
  trips,
  position,
  updatePosition,
  savedLocations,
  updateSavedLocations,
  handleWeatherSelection,
  localUser,
}) => {
  return (
    <div className="flex flex-col justify-start items-center h-fit w-full bg-night text-cream max-w-3xl z-10 pt-2">
      {trips.length > 0 && (
        <select
          className="w-fit p-2 bg-auburn text-cream rounded-md mb-2"
          onChange={(e) => {
            //one of these is probably a string, the other an integer and we're using ===
            const trip = trips.filter(
              (trip) => trip.id === parseInt(e.target.value)
            )[0];

            updateTrip({
              id: trip.id,
              name: trip.name,
              locations: trip.locations.map((loc) => ({
                id: loc.id,
                name: loc.name,
                office: loc.office,
                office_x: loc.office_x,
                office_y: loc.office_y,
                location: { lat: loc.latitude, lng: loc.longitude },
              })),
            });
          }}
        >
          <option selected disabled>
            Select Existing Trip
          </option>
          {trips.map((trip) => {
            return (
              <option key={trip.id} value={trip.id}>
                {trip.name}
              </option>
            );
          })}
        </select>
      )}
      <div className="flex flex-col items-center p-2">
        <div className="text-cream">Link New Locations to Account</div>
      </div>
      <MapControl
        {...{
          position,
          updatePosition,
          savedLocations,
          updateSavedLocations,
          weatherTargets: trip.locations,
          updateWeatherTargets: handleWeatherSelection,
          localUser,
        }}
      />
    </div>
  );
};

export default TripEdit;
