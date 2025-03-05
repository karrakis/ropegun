import React, { useState } from "react";
import classNames from "classnames";

export const Edit = ({ user, localUser, setEditing, setLocalUser }) => {
  const [multipitch, setMultipitch] = useState(localUser.multipitch || 0);
  const [leadBelay, setLeadBelay] = useState(localUser.lead_belay || 0);
  const [tradLead, setTradLead] = useState(localUser.trad_lead || 0);
  const [topRopeBelay, setTopRopeBelay] = useState(
    localUser.top_rope_belay || 0
  );
  const [tradOutdoorGrade, setTradOutdoorGrade] = useState(
    localUser.trad_climb_outdoor_grade || "?"
  );

  const [leadIndoorGrade, setLeadIndoorGrade] = useState(
    localUser.lead_climb_indoor_grade || "?"
  );
  const [leadOutdoorGrade, setLeadOutdoorGrade] = useState(
    localUser.lead_climb_outdoor_grade || "?"
  );

  const [topRopeOutdoorGrade, setTopRopeOutdoorGrade] = useState(
    localUser.tr_outdoor_climb_grade || "?"
  );
  const [topRopeIndoorGrade, setTopRopeIndoorGrade] = useState(
    localUser.tr_indoor_climb_grade || "?"
  );

  const [homeAddress, setHomeAddress] = useState(localUser.home_address || "");

  const [name, setName] = useState(localUser.given_name || "");

  const updateUser = (e) => {
    e.preventDefault();
    const body = {
      user: {
        multipitch: multipitch,
        lead_belay: leadBelay,
        trad_lead: tradLead,
        top_rope_belay: topRopeBelay,
        trad_climb_outdoor_grade: tradOutdoorGrade,
        lead_climb_indoor_grade: leadIndoorGrade,
        lead_climb_outdoor_grade: leadOutdoorGrade,
        tr_outdoor_climb_grade: topRopeOutdoorGrade,
        tr_indoor_climb_grade: topRopeIndoorGrade,
        home_address: homeAddress,
      },
    };

    fetch(`/users/${localUser.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-CSRF-Token": document.querySelector('[name="csrf-token"]').content,
      },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((data) => {
        setLocalUser(Object.assign({}, localUser, data));
      });
  };

  return (
    <>
      <div className="w-full relative">
        <button
          className="w-16 h-8 bg-cream text-night absolute top-0 right-0 cursor-pointer"
          onClick={(e) => {
            updateUser(e);
            setEditing(false);
          }}
        >
          Save
        </button>
      </div>
      <div className="flex flex-col w-full h-fit bg-night">
        <img
          className="w-32 h-32 ml-8 md:ml-16 my-8 md:ml-16"
          alt="User Profile Image"
          src={user.picture}
        ></img>
        <div
          id="user_info"
          className={classNames(
            "w-fit md:w-full h-fit flex flex-col p-8"
          )}
        >
          <div className="w-full h-fit flex flex-row items-end pb-8">
            <h4 className="text-2xl text-khaki min-w-fit col-span-1">Name:</h4>
            <label className="text-xl text-cream ml-4 w-fit col-span-2">
              {user.given_name} {user.family_name}
            </label>
            <input
              id="name"
              type="text"
              className="text-2xl p-2 w-full h-fit border-b"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="w-full md:w-full h-fit flex flex-col md:flex-row">
            <h4 className="text-2xl text-khaki min-w-fit col-span-1">Email:</h4>
            <span className="text-xl text-cream ml-4 w-fit col-span-2">
              {user.email}
            </span>
          </div>
        </div>
        <div className="p-8 w-full md:w-full h-fit flex flex-col md:flex-row">
          <label className="text-2xl text-khaki" htmlFor="homeAddress">
            Home Address:
          </label>
          <textarea
            id="homeAddress"
            type="text"
            className="text-2xl p-2 w-full h-fit border-b"
            value={homeAddress}
            onChange={(e) => setHomeAddress(e.target.value)}
          />
        </div>
      </div>
      <div className="w-full flex grid grid-cols-1 md:grid-cols-2 p-2 md:pl-16 gap-4 pt-4 bg-auburn">
        <div className="w-full flex items-end">
          <label className="text-2xl text-khaki" htmlFor="TopRopeBelay">
            Top Rope Belay:
          </label>
          <select
            id="leadBelay"
            className="h-8 w-fit text-2xl ml-2 appearance-none border-b cursor-pointer"
            value={topRopeBelay}
            onChange={(e) => setTopRopeBelay(e.target.value)}
          >
            <option value={0}>No</option>
            <option value={1}>Yes</option>
            <option value={2}>Rusty</option>
          </select>
        </div>
        <div className="w-full flex items-end">
          <label className="text-2xl text-khaki" htmlFor="leadBelay">
            Lead Belay:
          </label>
          <select
            id="leadBelay"
            className="h-8 w-fit text-2xl ml-2 appearance-none border-b cursor-pointer"
            value={leadBelay}
            onChange={(e) => setLeadBelay(e.target.value)}
          >
            <option value={0}>No</option>
            <option value={1}>Yes</option>
            <option value={2}>Rusty</option>
          </select>
        </div>
        <div className="w-full flex items-end">
          <label className="text-2xl text-khaki" htmlFor="topRopeIndoorGrade">
            Top Rope Indoor Grade:
          </label>
          <input
            id="topRopeIndoorGrade"
            type="text"
            className="text-2xl ml-2 w-12 border-b"
            value={topRopeIndoorGrade}
            onChange={(e) => setTopRopeIndoorGrade(e.target.value)}
          />
        </div>
        <div className="w-full flex items-end">
          <label className="text-2xl text-khaki" htmlFor="leadIndoorGrade">
            Lead Indoor Grade:
          </label>
          <input
            id="leadIndoorGrade"
            type="text"
            className="text-2xl ml-2 w-12 border-b"
            value={leadIndoorGrade}
            onChange={(e) => setLeadIndoorGrade(e.target.value)}
          />
        </div>
        <div className="w-full flex items-end">
          <label className="text-2xl text-khaki" htmlFor="topRopeOutdoorGrade">
            Top Rope Outdoor Grade:
          </label>
          <input
            id="topRopeOutdoorGrade"
            type="text"
            className="text-2xl ml-2 w-12 border-b"
            value={topRopeOutdoorGrade}
            onChange={(e) => setTopRopeOutdoorGrade(e.target.value)}
          />
        </div>
        <div className="w-full flex items-end">
          <label className="text-2xl text-khaki" htmlFor="leadOutdoorGrade">
            Lead Outdoor Grade:
          </label>
          <input
            id="leadOutdoorGrade"
            type="text"
            className="text-2xl ml-2 w-12 border-b"
            value={leadOutdoorGrade}
            onChange={(e) => setLeadOutdoorGrade(e.target.value)}
          />
        </div>
        <div className="w-full flex items-end">
          <label className="text-2xl text-khaki" htmlFor="tradLead">
            Trad Lead:
          </label>
          <select
            id="tradLead"
            className="h-8 w-fit text-2xl ml-2 appearance-none border-b cursor-pointer"
            value={tradLead}
            onChange={(e) => setTradLead(e.target.value)}
          >
            <option value={0}>No</option>
            <option value={1}>Yes</option>
            <option value={2}>Rusty</option>
          </select>
        </div>
        <div className="w-full flex items-end">
          <label htmlFor="tradOutdoorGrade" className="text-2xl text-khaki">
            Trad Outdoor Grade:
          </label>
          <input
            id="tradOutdoorGrade"
            type="text"
            className="text-2xl ml-2 w-12 border-b"
            value={tradOutdoorGrade}
            onChange={(e) => setTradOutdoorGrade(e.target.value)}
          />
        </div>
        <div className="w-full flex items-end">
          <label className="text-2xl text-khaki" htmlFor="multipitch">
            Multipitch:
          </label>
          <select
            id="multipitch"
            className="h-8 w-fit text-2xl ml-2 appearance-none border-b cursor-pointer"
            value={multipitch}
            onChange={(e) => setMultipitch(e.target.value)}
          >
            <option value={0}>No</option>
            <option value={1}>Yes</option>
            <option value={2}>Rusty</option>
          </select>
        </div>
      </div>
    </>
  );
};

export default Edit;
