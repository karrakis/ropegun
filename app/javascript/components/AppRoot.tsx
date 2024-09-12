import React, { useState, useEffect } from "react";
import Header from "./Header/Header";
import Home from "./Home/Home";
import Dashboard from "./Dashboard/Dashboard";
import TripPlan from "./TripPlan/TripPlan";
import ComingSoon from "./Home/ComingSoon";
import DevBlog from "./Devblog/Devblog";

import {
  UserSessionObject,
  Route,
  RouteList,
  AppRootProps,
  UserSavedLocation,
  UserSavedLocations,
} from "./types";

export const AppRoot: React.FC<AppRootProps> = ({
  routes,
  user,
  localUser,
  csrf,
  userSavedLocations,
}) => {
  const [currentPage, setPage] = useState(window.location.pathname);

  console.log("userSavedLocations", userSavedLocations);

  const setDisplayPage = () => {
    if (!localUser.id) {
      return <ComingSoon />;
    }
    switch (currentPage) {
      case "/":
        window.history.pushState({}, "Trip Planning", "/trip_plan");
        return (
          <TripPlan
            localUser={localUser}
            userSavedLocations={userSavedLocations}
          />
        );
      case "/home":
        window.history.pushState({}, "Home", "/home");
        return (
          <Home localUser={localUser} userSavedLocations={userSavedLocations} />
        );
      case "/dashboard":
        window.history.pushState({}, "Dashboard", "/dashboard");
        return <Dashboard user={user} localUser={localUser} />;
      case "/trip_plan":
        window.history.pushState({}, "Trip Planning", "/trip_plan");
        return (
          <TripPlan
            localUser={localUser}
            userSavedLocations={userSavedLocations}
          />
        );
      case "/development":
        window.history.pushState({}, "Development", "/development");
        return <DevBlog />;
    }
  };

  useEffect(() => {
    console.log(currentPage);
    setDisplayPage();
  }, [currentPage]);

  return (
    <div className="relative overflow-hidden h-screen">
      <a
        className="absolute top-0 left-0 -z-10 w-screen h-full"
        title="Geyikbayiri, Antalya, Turkey, by George Huestis, all rights reserved"
      >
        <img
          className="object-cover object-left h-full w-auto"
          width="512"
          alt="Geyikbayiri, Antalya, Turkey"
          src={require("../assets/Geyikbayiri.jpg")}
        />
      </a>

      <Header user={user} csrf={csrf} page={currentPage} setPage={setPage} />
      {setDisplayPage()}
    </div>
  );
};

export default AppRoot;
