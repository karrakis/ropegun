import React from "react";

export const Display = ({ user, localUser, setEditing }) => {
  return (
    <>
      <div className="w-full relative">
        <button
          className="w-16 h-8 bg-cream text-night absolute top-0 right-0 cursor-pointer"
          onClick={() => setEditing(true)}
        >
          Edit
        </button>
      </div>
      <div className="flex flex-row w-full h-fit">
        <img
          className="h-32 w-auto ml-16 my-16"
          alt="User Profile Image"
          src={user.picture}
        ></img>
        <div id="user_info" className="w-full text-cream m-16">
          <div className="w-full h-fit flex flex-row items-end  grid grid-cols-3">
            <h4 className="text-2xl text-khaki min-w-fit col-span-1">Name:</h4>
            <span className="text-xl ml-4 w-fit col-span-2">
              {user.given_name} {user.family_name}
            </span>
          </div>
          <div className="w-full h-fit flex flex-row items-end mt-4  grid grid-cols-3">
            <h4 className="text-2xl text-khaki min-w-fit col-span-1">Email:</h4>
            <span className="text-xl ml-4 w-fit col-span-2">{user.email}</span>
          </div>
          <div className="w-full h-fit flex flex-row items-end mt-4  grid grid-cols-3">
            <h4 className="text-2xl text-khaki min-w-fit col-span-1">
              Home Address:
            </h4>
            <span className="text-xl ml-4 w-fit col-span-2">
              {localUser.home_address}
            </span>
          </div>
        </div>
      </div>
      <div className="w-full flex grid grid-cols-1 md:grid-cols-2 ml-16">
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
    </>
  );
};

export default Display;
