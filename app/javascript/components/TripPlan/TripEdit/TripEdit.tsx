import React, { useState } from "react";
import { csrfToken } from "../../../utilities/csrfToken";
import classNames from "classnames";

import MapControl from "../../Map/MapControl";
import LocationsSelector from "../Locations/Selector";
import Select from "react-select";

export const TripEdit = ({
  trip,
  updateTrip,
  trips,
  position,
  updatePosition,
  userSavedLocations,
  savedLocations,
  updateSavedLocations,
  handleWeatherSelection,
  localUser,
}) => {
  //friends selected in the dropdown for invitations.
  const [friendsToInvite, updateFriendsToInvite] = useState([]);
  const [openMap, updateOpenMap] = useState(false);

  //sends invitations to the selected friends.
  const sendInvitations = () => {
    fetch(`/trip_invitations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken(),
      },
      body: JSON.stringify({
        trip_invitation: {
          trip_id: trip.id,
          issuer_id: localUser.id,
          invitee_uuids: JSON.stringify(
            friendsToInvite.map((friend) => friend.value)
          ),
        },
      }),
    }).then((response) => {
      console.log(response);
    });
  };

  //populates the dropdown for inviting friends.
  const friendSelectOptions = localUser.friendships.map((friend) => {
    console.log("testing", trip.trip_invitations);
    if (
      trip.trip_invitations
        ?.map((invitation) => invitation.invitee.uuid)
        .includes(friend.uuid)
    ) {
      return;
    }
    return {
      value: friend.uuid,
      label: friend.email + " - " + friend.name,
    };
  });

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
        <div className="flex flex-col items-center p-2 w-full">
          <div
            className="text-cream w-full p-2 bg-auburn text-center cursor-pointer"
            onClick={() => updateOpenMap(!openMap)}
          >
            {openMap ? "Close Map" : "Link New Locations to Account"}
          </div>
        </div>
        {openMap && (
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
        )}
      </div>
      <LocationsSelector
        trip={trip}
        updateTrip={updateTrip}
        locationOptions={userSavedLocations}
        updateLocations={handleWeatherSelection}
      />
      <Select
        options={friendSelectOptions}
        isMulti
        onChange={(selected) => {
          console.log("selected", selected);
          updateFriendsToInvite(selected);
        }}
        placeholder="Invite Friends"
        className="w-full p-2  bg-auburn text-night rounded-md mb-2"
      />
      <button
        onClick={sendInvitations}
        className="bg-auburn text-cream w-fit h-fit p-2 rounded-md"
      >
        Send Invitations
      </button>
      <div
        id="pending-invitations"
        className="flex flex-col items-center p-2 bg-night mt-2 w-full"
      >
        <h3 className="text-cream">Pending Invitations</h3>
        {trip.trip_invitations
          ?.filter((invitation) => invitation.accepted == false)
          ?.map((invitation) => {
            return (
              <div key={invitation.id}>
                <h3>{invitation.invitee.name}</h3>
                <h3>{invitation.invitee.email}</h3>
              </div>
            );
          })}
      </div>
      <div
        id="guests"
        className="flex flex-col items-center p-2 bg-night mt-2 w-full"
      >
        <h3 className="text-cream">Guests</h3>
        {trip.trip_invitations
          ?.filter((invitation) => invitation.accepted == true)
          ?.map((invitation) => {
            return (
              <div key={invitation.id}>
                <h3>{invitation.invitee.name}</h3>
                <h3>{invitation.invitee.email}</h3>
              </div>
            );
          })}
      </div>
    </>
  );
};

export default TripEdit;
