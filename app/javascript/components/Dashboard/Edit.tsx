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

  const [name, setName] = useState(localUser.name || "");

  const updateUser = (e) => {
    e.preventDefault();
    const body = {
      user: {
        name: name,
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
        debugger
        setLocalUser(Object.assign({}, localUser, data));
      });
  };

  const Bullet = ({ value, setValue, id, options }) => {
    return (
      <div className="w-full flex items-end">
        <label className="text-2xl text-khaki" htmlFor={id}>
          Lead Belay:
        </label>
        <select
          id={id}
          className="h-10 text-center w-fit text-2xl ml-2 appearance-none rounded-md bg-cream text-night cursor-pointer"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        >
          {options.map((option, index) => (
            <option key={index} value={index}>
              {option}
            </option>
          ))}
        </select>
      </div>
    )
  };

  const TextBullet = ({ value, setValue, id }) => {
    return (
      <div className="w-full flex items-end">
        <label className="text-2xl text-khaki" htmlFor={id}>
          {id}:
        </label>
        <input
          id={id}
          type="text"
          className="h-10 text-center text-2xl ml-2 w-12 rounded-md bg-cream text-night"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
    )
  }

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
          <div className="w-full h-fit flex flex-row items-center pb-8">
            <h4 className="text-2xl text-khaki min-w-fit col-span-1">Name:</h4>
            <label className="text-xl text-cream ml-4 w-fit col-span-2" htmlFor="name">
              {localUser.name}
            </label>
            <input
              id="name"
              type="text"
              className="ml-4 text-2xl p-2 border rounded-lg bg-cream text-night h-10"
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
            className="text-2xl p-2 w-full h-fit rounded-lg bg-cream text-night"
            value={homeAddress}
            onChange={(e) => setHomeAddress(e.target.value)}
          />
        </div>
      </div>
      <div className="w-full flex grid grid-cols-1 md:grid-cols-2 p-2 md:pl-16 gap-4 pt-4 bg-auburn">
        <Bullet value={topRopeBelay} setValue={setTopRopeBelay} id={"topRopeBelay"} options={["No", "Yes", "Rusty"]}/>
        <Bullet value={leadBelay} setValue={setLeadBelay} id={"leadBelay"} options={["No", "Yes", "Rusty"]}/>
        <TextBullet value={topRopeIndoorGrade} setValue={setTopRopeIndoorGrade} id={"topRopeIndoorGrade"}/>
        <TextBullet value={leadIndoorGrade} setValue={setLeadIndoorGrade} id={"leadIndoorGrade"}/>
        <TextBullet value={topRopeOutdoorGrade} setValue={setTopRopeOutdoorGrade} id={"topRopeOutdoorGrade"}/>
        <TextBullet value={leadOutdoorGrade} setValue={setLeadOutdoorGrade} id={"leadOutdoorGrade"}/>
        <Bullet value={tradLead} setValue={setTradLead} id={"tradLead"} options={["No", "Yes", "Rusty"]}/>
        <TextBullet value={tradOutdoorGrade} setValue={setTradOutdoorGrade} id={"tradOutdoorGrade"}/>
        <Bullet value={multipitch} setValue={setMultipitch} id={"multipitch"} options={["No", "Yes", "Rusty"]}/>
      </div>
    </>
  );
};

export default Edit;
