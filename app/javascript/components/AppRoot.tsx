import React from "react";

export const Bouncer = () => {
  console.log("bouncer?");
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
  console.log("the fuck?");
  return (
    <>
      <div
        className="text-white h-8 w-full flex items-center sticky top-0 z-50 bg-center bg-no-repeat bg-top -mb-8 border border-bot border-black"
        style={{ backgroundImage: "url(dreamcatcher.jpg)" }}
      >
        <div id="header-left" className="justify-start flex w-full">
          <span>Kitsunesays</span>
        </div>
        <div id="header-right" className="justify-end flex w-full">
          <span className="mr-4">Profile</span>
          <span className="mr-4">Log In</span>
        </div>
      </div>
      <div
        className="flex flex-col min-h-screen w-full bg-no-repeat bg-center bg-top"
        style={{
          backgroundImage: `linear-gradient(to top, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0)), url(dreamcatcher.jpg)`,
        }}
      >
        <Bouncer />
        <Bouncer />
        <Bouncer />
      </div>
    </>
  );
};

export default AppRoot;
