import React, { useState } from "react";
import { csrfToken } from "../../../utilities/csrfToken";
import classNames from "classnames";

import Select from "react-select";

export const People = ({ trip, localUser, updateTrips }) => {
  const [friendsToInvite, updateFriendsToInvite] = useState([]);

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
    <div className="w-full bg-night z-10 p-2">
      <Select
        options={friendSelectOptions}
        isMulti
        onChange={(selected) => {
          console.log("selected", selected);
          updateFriendsToInvite(selected);
        }}
        placeholder="Invite Friends"
        className="w-full text-night mb-2"
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
    </div>
  );
};

export default People;
