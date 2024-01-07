import React, { useState } from "react";

export const Edit = ({ user, localUser }) => {
  const [multipitch, setMultipitch] = useState(localUser.multipitch || 0);
  const [leadBelay, setLeadBelay] = useState(localUser.lead_belay || 0);
  const [tradLead, setTradLead] = useState(localUser.trad_lead || 0);
  const [topRopeBelay, setTopRopeBelay] = useState(
    localUser.top_rope_belay || 0
  );
  const [tradOutdoorGrade, setTradOutdoorGrade] = useState(
    localUser.trad_climb_outdoor_grade || "?"
  );
  const [leadOutdoorGrade, setLeadOutdoorGrade] = useState(
    localUser.lead_climb_outdoor_grade || "?"
  );

  console.log(multipitch);

  return (
    <form>
      <div className="flex flex-row w-full h-fit">
        <img
          className="h-32 w-auto ml-16 my-16"
          alt="User Profile Image"
          src={user.picture}
        ></img>
        <div id="user_info" className="w-full text-cream m-16">
          <div className="w-full h-fit flex flex-row items-end  grid grid-cols-3">
            <h4 className="text-2xl text-khaki min-w-fit col-span-1">
              User Name:
            </h4>
            <span className="text-xl ml-4 w-fit col-span-2">
              {user.given_name} {user.family_name}
            </span>
          </div>
          <div className="w-full h-fit flex flex-row items-end mt-4  grid grid-cols-3">
            <h4 className="text-2xl text-khaki min-w-fit col-span-1">
              User Email:
            </h4>
            <span className="text-xl ml-4 w-fit col-span-2">{user.email}</span>
          </div>
        </div>
      </div>
      <div className="w-full flex grid grid-cols-1 md:grid-cols-2 ml-16 gap-4">
        <div className="w-full grid-cols-2 flex items-end">
          <label className="text-2xl text-khaki" htmlFor="TopRopeBelay">
            Top Rope Belay:
          </label>
          <select
            id="leadBelay"
            className="h-8 w-fit bg-auburn text-2xl ml-2 appearance-none border-b cursor-pointer"
            value={topRopeBelay}
            onChange={(e) => setTopRopeBelay(e.target.value)}
          >
            <option value={0}>No</option>
            <option value={1}>Yes</option>
            <option value={2}>Rusty</option>
          </select>
        </div>
        <div className="w-full grid-cols-2 flex items-end">
          <label className="text-2xl text-khaki" htmlFor="leadBelay">
            Lead Belay:
          </label>
          <select
            id="leadBelay"
            className="h-8 w-fit bg-auburn text-2xl ml-2 appearance-none border-b cursor-pointer"
            value={leadBelay}
            onChange={(e) => setLeadBelay(e.target.value)}
          >
            <option value={0}>No</option>
            <option value={1}>Yes</option>
            <option value={2}>Rusty</option>
          </select>
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
          <label className="text-2xl text-khaki" htmlFor="leadOutdoorGrade">
            Lead Outdoor Grade:
          </label>
          <input
            id="leadOutdoorGrade"
            type="text"
            className="text-2xl ml-2 w-12 bg-auburn border-b"
            value={leadOutdoorGrade}
            onChange={(e) => setLeadOutdoorGrade(e.target.value)}
          />
        </div>
        <div className="w-full grid-cols-2 flex items-end">
          <label className="text-2xl text-khaki" htmlFor="tradLead">
            Trad Lead:
          </label>
          <select
            id="tradLead"
            className="h-8 w-fit bg-auburn text-2xl ml-2 appearance-none border-b cursor-pointer"
            value={tradLead}
            onChange={(e) => setTradLead(e.target.value)}
          >
            <option value={0}>No</option>
            <option value={1}>Yes</option>
            <option value={2}>Rusty</option>
          </select>
        </div>
        <div className="w-full grid-cols-2 flex items-end">
          <label htmlFor="tradOutdoorGrade" className="text-2xl text-khaki">
            Trad Outdoor Grade:
          </label>
          <input
            id="tradOutdoorGrade"
            type="text"
            className="text-2xl ml-2 w-12 bg-auburn border-b"
            value={tradOutdoorGrade}
            onChange={(e) => setTradOutdoorGrade(e.target.value)}
          />
        </div>
        <div className="w-full grid-cols-2 flex items-end">
          <label className="text-2xl text-khaki" htmlFor="multipitch">
            Multipitch:
          </label>
          <select
            id="multipitch"
            className="h-8 w-fit bg-auburn text-2xl ml-2 appearance-none border-b cursor-pointer"
            value={multipitch}
            onChange={(e) => setMultipitch(e.target.value)}
          >
            <option value={0}>No</option>
            <option value={1}>Yes</option>
            <option value={2}>Rusty</option>
          </select>
        </div>
      </div>
    </form>
  );
};

export default Edit;
