import React from "react";

export const TripPlan = ({ user, localUser, userSavedLocations }) => {
  console.log(user);
  console.log(localUser);
  console.log(userSavedLocations);
  return (
    <div className="w-full flex flex-row justify-center">
      <div className="flex flex-col justify-start h-screen overflow-scroll w-full bg-auburn text-cream  max-w-3xl">
        <div className="flex flex-col items-center p-2 bg-cream text-auburn">
          <h1>Plan a Trip</h1>
          <form>
            <input type="text" placeholder="Name Your Trip" />
            <select name="location" id="location">
              {userSavedLocations
                .map((loc) => {
                  return (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  );
                })
                .concat(
                  <option value="" disabled selected>
                    Add a Location Option
                  </option>
                )}
            </select>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TripPlan;
