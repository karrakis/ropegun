import React from "react";

export const Bouncer = () => {
  return (
    <>
      <div className="w-full flex justify-start">
        <div className="bg-yellow-300 bg-gradient-to-t from-slate-300 w-64 h-64 hover:animate-bounce"></div>
      </div>

      <div className="w-full flex justify-center">
        <div className="bg-yellow-300 bg-gradient-to-t from-slate-300 w-64 h-64 hover:animate-bounce"></div>
      </div>

      <div className="w-full flex justify-end">
        <div className="bg-yellow-300 bg-gradient-to-t from-slate-300 w-64 h-64 hover:animate-bounce"></div>
      </div>
    </>
  );
};

export const AppRoot = () => {
  return (
    <>
      <div className="bg-blue-900 text-white h-8 w-full flex items-center sticky top-0 z-50">
        <div id="header-left" className="justify-start flex w-full">
          <span>Kitsunesays</span>
        </div>
        <div id="header-right" className="justify-end flex w-full">
          <span className="mr-4">Profile</span>
          <span className="mr-4">Log In</span>
        </div>
      </div>
      <div className="bg-slate-300 bg-gradient-to-b from-blue-900 flex flex-col min-h-screen">
        <Bouncer />
        <Bouncer />
        <Bouncer />
      </div>
    </>
  );
};

export default AppRoot;
