import React, { useState, useEffect } from "react";

export const HeaderLeft = ({ page, setPage }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const unfoldMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    setMenuOpen(false);
  }, [page]);

  return (
    <div
      id="header-left"
      className="justify-start flex w-full ml-2 cursor-pointer"
    >
      <div onClick={() => setPage("/trip_plan")} className="flex">
        <img
          className="h-12"
          src={require("../../assets/mountains-transparency5.png")}
        />
        <span className="px-4 py-2 bg-auburn text-xl flex flex-row items-center hidden md:block">
          <span>Approach</span>
        </span>
      </div>
      <div onClick={() => setPage("/trip_plan")} className="flex ml-2">
        <span className="px-4 py-2 bg-auburn text-xl flex flex-row items-center hidden md:block">
          <span>Plan a Trip</span>
        </span>
      </div>
      <div onClick={() => setPage("/development")} className="flex ml-2">
        <span className="px-4 py-2 bg-auburn text-xl flex flex-row items-center hidden md:block">
          <span>App Roadmap</span>
        </span>
      </div>
      <div
        onClick={() => unfoldMenu()}
        className="flex ml-2 w-8 h-8 flex-none md:hidden"
      >
        <div
          className="w-full h-full"
          style={{
            borderLeft: "2px solid #f7f7f7",
            borderBottom: "2px solid #f7f7f7",
            transform: "rotate(-45deg) translate(50%, 50%)",
            height: "2rem",
          }}
        ></div>
      </div>
      {menuOpen && (
        <div className="flex flex-col bg-night text-cream absolute top-16 left-0 w-full items-center pb-8 md:hidden">
          <div className="flex flex-col w-1/2">
            <div onClick={() => setPage("/trip_plan")} className="flex">
              <span className="px-4 py-2 bg-auburn text-xl flex flex-row items-center w-full mt-4">
                <span>Approach</span>
              </span>
            </div>
            <div onClick={() => setPage("/trip_plan")} className="flex">
              <span className="px-4 py-2 bg-auburn text-xl flex flex-row items-center w-full mt-4">
                <span>Plan a Trip</span>
              </span>
            </div>
            <div onClick={() => setPage("/development")} className="flex">
              <span className="px-4 py-2 bg-auburn text-xl flex flex-row items-center w-full mt-4">
                <span>App Roadmap</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderLeft;
