import React, { useState, useEffect } from "react";
import Header from "./Header/Header";
import Home from "./Home/Home";
import Dashboard from "./Dashboard/Dashboard";
import TripPlan from "./TripPlan/TripPlan";
import ComingSoon from "./Home/ComingSoon";
import DevBlog from "./Devblog/Devblog";

import {Geyikbayiri} from "../../assets/images/Geyikbayiri.jpg"

import {
  UserSessionObject,
  Route,
  RouteList,
  AppRootProps,
} from "./types";

export const AppRoot: React.FC<AppRootProps> = ({
  user,
  localUser,
  csrf,
}) => {
  const [currentPage, setPage] = useState(window.location.pathname);

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
          />
        );
      case "/home":
        window.history.pushState({}, "Home", "/home");
        return (
          <Home localUser={localUser} />
        );
      case "/dashboard":
        window.history.pushState({}, "Dashboard", "/dashboard");
        return <Dashboard user={user} localUser={localUser} />;
      case "/trip_plan":
        window.history.pushState({}, "Trip Planning", "/trip_plan");
        return (
          <TripPlan
            localUser={localUser}
          />
        );
      case "/development":
        window.history.pushState({}, "Development", "/development");
        return <DevBlog />;
    }
  };

  useEffect(() => {
    setDisplayPage();
  }, [currentPage]);

  return (
    <div className="relative overflow-hidden h-screen">
      <a
        className="absolute top-0 left-0 -z-10 w-screen h-full"
        title="Geyikbayiri, Antalya, Turkey, by George Huestis, all rights reserved"
      >
        <img
          className="object-cover object-left w-full h-auto min-h-screen"
          width="512"
          alt="Geyikbayiri, Antalya, Turkey"
          src={require("../../assets/images/Geyikbayiri.jpg")}
        />
      </a>

      <Header user={user} csrf={csrf} page={currentPage} setPage={setPage} />
      {setDisplayPage()}
    </div>
  );
};

export default AppRoot;
