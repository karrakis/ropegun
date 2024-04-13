import React from "react";
import logo from "../../assets/mountains-transparency5.png";

export const HeaderLeft = ({ setPage }) => {
  return (
    <div
      id="header-left"
      className="justify-start flex w-full ml-2 cursor-pointer"
    >
      <div onClick={() => setPage("/home")} className="flex">
        <img className="h-12" src={logo} />
        <span className="px-4 py-2 bg-auburn text-xl flex flex-row items-center">
          <span>Approach</span>
        </span>
      </div>
      <div onClick={() => setPage("/trip_plan")} className="flex ml-2">
        <span className="px-4 py-2 bg-auburn text-xl flex flex-row items-center">
          <span>Plan a Trip</span>
        </span>
      </div>
    </div>
  );
};

export default HeaderLeft;
