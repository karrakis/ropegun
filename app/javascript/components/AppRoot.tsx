import React from "react";

export const SectionHeader = ({ children }: any) => {
  return (
    <div className="w-full flex justify-center my-4">
      <h1 className="text-xl font-bold bg-white border border-green-500 px-4 py-2 h-auto">
        {children}
      </h1>
    </div>
  );
};

export const LinkTitle = ({ children }: any) => {
  return (
    <div className="w-full flex justify-center p-2">
      <h2 className="text-xl font-bold bg-white border border-green-500 px-2 py-1 h-auto">
        {children}
      </h2>
    </div>
  );
};

interface LinkBoxProps {
  background: string;
  title: string;
  onClick: Function;
}

export const LinkBox = ({ background, title, onClick }: LinkBoxProps) => {
  return (
    <div
      style={{
        backgroundImage: `url(${background})`,
      }}
      onClick={onClick}
      className="p-2 flex-none w-fit m-2"
    >
      <LinkTitle>{title}</LinkTitle>
    </div>
  );
};

export const Climbers = () => {
  return (
    <div className="flex w-full justify-center my-8 h-96">
      <div className="w-2/3 h-full flex flex-col justify-start bg-green-300 drop-shadow-2xl border border-green-500">
        <SectionHeader>Climbers</SectionHeader>
        <LinkBox
          background="dreamcatcher.jpg"
          title="Find Opportunities"
          onClick={() => {}}
        />
        <LinkBox
          background="dreamcatcher.jpg"
          title="Advertise Skills"
          onClick={() => {}}
        />
      </div>
    </div>
  );
};

export const Organizers = () => {
  return (
    <div className="flex w-full justify-center my-8 h-96">
      <div className="w-2/3 h-full flex flex-col justify-start bg-orange-300 drop-shadow-2xl border border-orange-500">
        <SectionHeader>Organizers</SectionHeader>
        <LinkBox
          background="dreamcatcher.jpg"
          title="Create Opportunities"
          onClick={() => {}}
        />
        <LinkBox
          background="dreamcatcher.jpg"
          title="Manage Opportunities"
          onClick={() => {}}
        />
      </div>
    </div>
  );
};

export const AppRoot = () => {
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
        <Climbers />
        <Organizers />
      </div>
    </>
  );
};

export default AppRoot;
