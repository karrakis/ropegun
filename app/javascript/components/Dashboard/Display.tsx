import React from "react";

export const Display = ({ user, localUser, setEditing }) => {
  const sendFriendInvite = (uuid) => {
    //create a new friendship via the friendships controller
    fetch("/friendships", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        friendship: {
          user_id: localUser.id,
          friend_id: uuid,
        },
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  return (
    <>
      <div className="flex flex-col md:flex-row w-full h-fit bg-night relative">
        <button
          className="w-16 h-8 bg-cream text-night absolute top-0 right-0 cursor-pointer"
          onClick={() => setEditing(true)}
        >
          Edit
        </button>
        <img
          className="w-32 h-32 ml-8 md:ml-16 my-8 md:ml-16"
          alt="User Profile Image"
          src={user.picture}
        ></img>
        <div id="user_info" className="w-full text-cream p-8 p-2">
          <div className="w-fit md:w-full h-fit flex flex-col md:flex-row">
            <h4 className="text-2xl text-khaki min-w-fit">Name:</h4>
            <span className="text-xl ml-4 w-fit">
              {user.given_name} {user.family_name}
            </span>
          </div>
          <div className="w-full md:w-full h-fit flex flex-col md:flex-row">
            <h4 className="text-2xl text-khaki min-w-fit">Email:</h4>
            <div className="text-xl ml-4 w-fit">{user.email}</div>
          </div>
          <div className="w-full md:w-full h-fit flex flex-col md:flex-row">
            <h4 className="text-2xl text-khaki min-w-fit">Home Address:</h4>
            <span className="text-xl ml-4 w-fit">{localUser.home_address}</span>
          </div>
        </div>
      </div>
      <div className="w-full flex grid grid-cols-1 md:grid-cols-2 bg-auburn p-2 text-cream">
        <div className="w-full grid-cols-2 flex items-end">
          <h4 className="text-2xl text-khaki">Top Rope Belay:</h4>
          <span className="text-2xl ml-2">
            {localUser.top_rope_belay || "No"}
          </span>
        </div>
        <div className="w-full grid-cols-2 flex items-end">
          <h4 className="text-2xl text-khaki">Lead Belay:</h4>
          <span className="text-2xl ml-2">{localUser.lead_belay || "No"}</span>
        </div>
        <div className="w-full grid-cols-2 flex items-end">
          <h4 className="text-2xl text-khaki">Top Rope Indoor Grade:</h4>
          <span className="text-2xl ml-2">
            {localUser.tr_indoor_climb_grade || "?"}
          </span>
        </div>
        <div className="w-full grid-cols-2 flex items-end">
          <h4 className="text-2xl text-khaki">Lead Indoor Grade:</h4>
          <span className="text-2xl ml-2">
            {localUser.lead_climb_indoor_grade || "?"}
          </span>
        </div>
        <div className="w-full grid-cols-2 flex items-end">
          <h4 className="text-2xl text-khaki">Top Rope Outdoor Grade:</h4>
          <span className="text-2xl ml-2">
            {localUser.tr_outdoor_climb_grade || "?"}
          </span>
        </div>
        <div className="w-full grid-cols-2 flex items-end">
          <h4 className="text-2xl text-khaki">Lead Outdoor Grade:</h4>
          <span className="text-2xl ml-2">
            {localUser.lead_climb_outdoor_grade || "?"}
          </span>
        </div>
        <div className="w-full grid-cols-2 flex items-end">
          <h4 className="text-2xl text-khaki">Trad Lead:</h4>
          <span className="text-2xl ml-2">{localUser.trad_lead || "No"}</span>
        </div>
        <div className="w-full grid-cols-2 flex items-end">
          <h4 className="text-2xl text-khaki">Trad Outdoor Grade:</h4>
          <span className="text-2xl ml-2">
            {localUser.trad_climb_outdoor_grade || "?"}
          </span>
        </div>
        <div className="w-full grid-cols-2 flex items-end">
          <h4 className="text-2xl text-khaki">Multipitch:</h4>
          <span className="text-2xl ml-2">{localUser.multipitch || "No"}</span>
        </div>
      </div>
      <div>
        <h1>Friendships</h1>
        <h2>Your UUID:</h2>
        <p>{localUser.uuid}</p>
        <h2>Send Friend Invite</h2>
        <div>
          <input type="text" placeholder="Friend's UUID" />
          <button onClick={(e) => sendFriendInvite(e.target.value)}>
            Send Invite
          </button>
        </div>
        <h2>These Users Want to be Friends</h2>
        <ul>
          {localUser?.friend_requests?.map((request) => (
            <li key={request.id}>{request.name}</li>
          ))}
        </ul>
        <h2>Friends List</h2>
        <ul>
          {localUser?.friends?.map((friend) => (
            <li key={friend.id}>{friend.name}</li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Display;
