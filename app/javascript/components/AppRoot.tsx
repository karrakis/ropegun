import React from "react";
import logo from "../assets/mountains-transparency5.png";
import NavContainerGray from "./NavContainerGray";
import SectionHeader from "./SectionHeader";
import LinkBox from "./LinkBox";

interface UserSessionObject {
  name: string;
  picture: string;
}

interface Route {
  path: string;
  name: string;
}

interface RouteList {
  dashboard: Route;
}

interface AppRootProps {
  routes: RouteList;
  user: UserSessionObject;
}

export const Climbers = () => {
  return (
    <NavContainerGray>
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
    </NavContainerGray>
  );
};

export const Organizers = () => {
  return (
    <NavContainerGray>
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
    </NavContainerGray>
  );
};

export const AppRoot = ({ routes, user }: AppRootProps) => {
  const csrf = document
    .querySelector("meta[name='csrf-token']")
    .getAttribute("content");

  console.log("logo located at:", logo);

  return (
    <div className="relative">
      <a
        className="absolute top-0 left-0 -z-10"
        title="Paulhaberstroh, CC BY-SA 4.0 'https://creativecommons.org/licenses/by-sa/4.0', via Wikimedia Commons"
        href="https://commons.wikimedia.org/wiki/File:Boulder_Flatirons.jpg"
      >
        <img
          className="w-screen h-auto"
          width="512"
          alt="Boulder Flatirons"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Boulder_Flatirons.jpg/512px-Boulder_Flatirons.jpg"
        />
      </a>
      <div className="text-white h-16 w-full flex items-center sticky top-0 z-50 bg-night text-cream">
        <div id="header-left" className="justify-start flex w-full ml-2">
          <img className="h-12" src={logo} />
          <span className="px-4 py-2 bg-auburn text-xl flex flex-row items-center">
            <span>Approach</span>
          </span>
        </div>
        <div id="header-right" className="justify-end flex w-full h-full">
          {!!user && (
            <form
              className="button_to m-2 flex items-center justify-end"
              method="get"
              action="/auth/logout"
            >
              <button
                className="p-2 h-12 bg-auburn"
                data-turbo="false"
                type="submit"
              >
                Log Out
              </button>
              <input
                type="hidden"
                name="authenticity_token"
                value={csrf}
                autoComplete="off"
              ></input>
              <a
                data-turbo="false"
                className="h-full w-auto mr-2 cursor-pointer"
                href={routes.dashboard.path}
              >
                <img className="h-12 w-auto" src={user.picture}></img>
              </a>
            </form>
          )}
          {!user && (
            <form className="button_to m-2" method="post" action="/auth/auth0">
              <button
                className="bg-auburn p-2 m-2"
                data-turbo="false"
                type="submit"
              >
                Login
              </button>
              <input
                type="hidden"
                name="authenticity_token"
                value={csrf}
                autoComplete="off"
              ></input>
            </form>
          )}
        </div>
      </div>
      <div className="w-full flex flex-row justify-center">
        <div className="flex flex-col md:flex-row justify-start md:justify-center min-h-screen w-full bg-auburn text-cream  max-w-3xl">
          <Climbers />
          <Organizers />
        </div>
      </div>
    </div>
  );
};

export default AppRoot;
