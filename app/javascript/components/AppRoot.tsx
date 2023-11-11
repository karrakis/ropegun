import React from "react";
import NavContainerGray from "./NavContainer/NavContainerGray";
import SectionHeader from "./NavContainer/SectionHeader";
import LinkBox from "./NavContainer/LinkBox";
import Header from "./Header/Header";

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
  csrf: string;
}

export const Climbers = () => {
  return (
    <NavContainerGray>
      <SectionHeader>Climbers</SectionHeader>
      <LinkBox title="Find Opportunities" onClick={() => {}} />
      <LinkBox title="Advertise Skills" onClick={() => {}} />
    </NavContainerGray>
  );
};

export const Organizers = () => {
  return (
    <NavContainerGray>
      <SectionHeader>Organizers</SectionHeader>
      <LinkBox title="Create Opportunities" onClick={() => {}} />
      <LinkBox title="Manage Opportunities" onClick={() => {}} />
    </NavContainerGray>
  );
};

export const AppRoot = ({ routes, user, csrf }: AppRootProps) => {
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
      <Header user={user} csrf={csrf} dashboard_path={routes.dashboard.path} />
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
