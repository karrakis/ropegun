import React, { useState, useEffect } from "react";
import Header from "./Header/Header";
import Home from "./Home/Home";
import Dashboard from "./Dashboard/Dashboard";

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
  localUser: JSON;
  csrf: string;
  userSavedLocations: JSON;
}

export const AppRoot = ({
  routes,
  user,
  localUser,
  csrf,
  userSavedLocations,
}: AppRootProps) => {
  const [currentPage, setPage] = useState(window.location.pathname);

  const setDisplayPage = () => {
    switch (currentPage) {
      case "/":
        window.history.pushState({}, "Home", "/");
        return (
          <Home localUser={localUser} userSavedLocations={userSavedLocations} />
        );
      case "/home":
        window.history.pushState({}, "Home", "/");
        return (
          <Home localUser={localUser} userSavedLocations={userSavedLocations} />
        );
      case "/dashboard":
        window.history.pushState({}, "Dashboard", "/dashboard");
        return <Dashboard user={user} localUser={localUser} />;
    }
  };

  useEffect(() => {
    console.log(currentPage);
    setDisplayPage();
  }, [currentPage]);

  return (
    <div className="relative">
      <a
        className="absolute top-0 left-0 -z-10"
        title="Paulhaberstroh, CC BY-SA 4.0 'https://creativecommons.org/licenses/by-sa/4.0', via Wikimedia Commons"
        href="https://commons.wikimedia.org/wiki/File:Boulder_Flatirons.jpg"
      >
        <img
          className="min-w-screen min-h-screen"
          width="512"
          alt="Boulder Flatirons"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Boulder_Flatirons.jpg/512px-Boulder_Flatirons.jpg"
        />
      </a>
      <Header user={user} csrf={csrf} setPage={setPage} />
      {setDisplayPage()}
    </div>
  );
};

export default AppRoot;
