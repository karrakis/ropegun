import React from "react";
import logo from "../../assets/mountains-transparency5.png";

export const HeaderLeft = ({ setPage }) => {
  return (
    <div
      id="header-left"
      className="justify-start flex w-full ml-2 cursor-pointer"
      onClick={() => setPage("/home")}
    >
      <img className="h-12" src={logo} />
      <span className="px-4 py-2 bg-auburn text-xl flex flex-row items-center">
        <span>Approach</span>
      </span>
    </div>
  );
};

export default HeaderLeft;
