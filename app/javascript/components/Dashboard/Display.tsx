import React from "react";
import { csrfToken } from "../../utilities/csrfToken";

export const Display = ({ user, localUser, setEditing }) => {
  console.log("localUser:", localUser);
  const [friendId, updateFriendId] = React.useState("");

  const [friendInvites, setFriendInvites] = React.useState([]);
  const [pendingFriendRequests, setPendingFriendRequests] = React.useState([]);
  const [friends, setFriends] = React.useState(localUser.friendships);

  const sendFriendInvite = (uuid) => {
    //create a new friendship via the friendships controller
    fetch("/friendships", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken(),
      },
      body: JSON.stringify({
        friendship: {
          user_id: localUser.id,
          friend_uuid: uuid,
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

  const acceptInvite = (uuid) => {
    // update the friendship to accepted
    fetch(`/friendships`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken(),
      },
      body: JSON.stringify({
        friendship: {
          status: "accepted",
          user_id: localUser.id,
          friend_uuid: uuid,
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

  const rejectInvite = (uuid) => {
    // delete the friendship
    fetch(`/friendships`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken(),
      },
      body: JSON.stringify({
        friendship: {
          user_id: localUser.id,
          friend_uuid: uuid,
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
      <div className="w-full flex bg-night p-2 text-cream">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 bg-auburn rounded-lg p-2">
          <div className="w-full grid-cols-2 flex items-end">
            <h4 className="text-2xl text-khaki">Top Rope Belay:</h4>
            <span className="text-2xl ml-2">
              {localUser.top_rope_belay || "No"}
            </span>
          </div>
          <div className="w-full grid-cols-2 flex items-end">
            <h4 className="text-2xl text-khaki">Lead Belay:</h4>
            <span className="text-2xl ml-2">
              {localUser.lead_belay || "No"}
            </span>
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
            <span className="text-2xl ml-2">
              {localUser.multipitch || "No"}
            </span>
          </div>
        </div>
      </div>
      <div
        id="friendships"
        className="w-full flex flex-col bg-khaki items-center justify-center"
      >
        <h1 className="w-full bg-night text-khaki text-2xl font-strong text-center p-2">
          Friends
        </h1>
        <div
          id="sharing-key"
          className="mt-2 bg-night text-khaki w-full text-center p-2"
        >
          <h2 className="text-xl">Your Friendship Key:</h2>
          <p className="text-lg text-auburn">{localUser.uuid}</p>
        </div>
        <div
          id="invite-friends"
          className="mt-2 bg-night text-khaki w-full text-center p-2"
        >
          <h2 className="text-xl">Send Friend Invite</h2>
          <div className="mt-2">
            <input
              type="text"
              className="w-64 h-8 bg-cream text-night p-2 rounded-md mb-1"
              placeholder="Friend's Friendship Key"
              value={friendId}
              onChange={(e) => updateFriendId(e.target.value)}
            />
            <button
              onClick={() => sendFriendInvite(friendId)}
              className="w-fit text-cream h-8 py-1 px-2 bg-auburn ml-2 rounded-md"
            >
              Send Invite
            </button>
          </div>
        </div>
        <div
          id="invites-from-others"
          className="mt-2 w-full bg-night text-khaki text-center p-2"
        >
          <h2 className="text-xl">Invites from Others:</h2>
          <ul className="p-2">
            {localUser?.pending_friendship_invitations.length > 0 ? (
              localUser?.pending_friendship_invitations.map((request) => (
                <li key={request.id}>
                  {request.name} ({request.email})
                  <button onClick={() => acceptInvite(request.uuid)}>
                    Accept
                  </button>
                  <button onClick={() => rejectInvite(request.uuid)}>
                    Reject
                  </button>
                </li>
              ))
            ) : (
              <span>Nobody likes you.</span>
            )}
          </ul>
        </div>
        <div
          id="pending-friend-requests"
          className="mt-2 w-full bg-night text-khaki text-center p-2"
        >
          <h2 className="text-xl">Pending Friend Requests You've Sent</h2>
          <ul className="p-2">
            {localUser?.pending_friend_requests.length > 0 ? (
              localUser?.pending_friend_requests.map((request) => (
                <li key={request.id}>{request.uuid}</li>
              ))
            ) : (
              <span>You don't like anyone.</span>
            )}
          </ul>
        </div>
        <div
          id="friends-list"
          className="mt-2 w-full bg-night text-khaki text-center p-2"
        >
          <h2 className="text-xl">Friends List</h2>
          <ul className="p-2">
            {localUser?.friendships?.map((friend) => (
              <li key={friend.id}>
                {friend.name} ({friend.email})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Display;
