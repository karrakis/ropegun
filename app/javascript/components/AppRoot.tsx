import React, { useState, useEffect } from "react";
import Header from "./Header/Header";
import Home from "./Home/Home";
import Dashboard from "./Dashboard/Dashboard";
import TripPlan from "./TripPlan/TripPlan";
import ComingSoon from "./Home/Landing";
import DevBlog from "./Devblog/Devblog";

import { Geyikbayiri } from "../../assets/images/Geyikbayiri.jpg";

import { UserSessionObject, Route, RouteList, AppRootProps } from "./types";

export const AppRoot: React.FC<AppRootProps> = ({ user, localUser, csrf }) => {
  const [currentPage, setCurrentPage] = useState(window.location.pathname);

  // Navigate: updates the URL and notifies all listeners (this component and
  // any nested router, e.g. TripPlan) via a popstate event.
  const goToPage = (path: string) => {
    if (path !== window.location.pathname) {
      window.history.pushState({}, "", path);
    }
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  // Keep currentPage in sync with the URL for back/forward navigation and
  // for navigations triggered elsewhere (e.g. TripPlan's internal router).
  useEffect(() => {
    const onPop = () => setCurrentPage(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const setDisplayPage = () => {
    if (!localUser.id) {
      return <ComingSoon />;
    }
    switch (currentPage) {
      case "/":
        return <TripPlan localUser={localUser} />;
      case "/home":
        return <Home localUser={localUser} />;
      case "/dashboard":
        return <Dashboard user={user} localUser={localUser} />;
      case "/trip_plan":
        return <TripPlan localUser={localUser} />;
      case "/development":
        return <DevBlog />;
      default:
        if (currentPage.startsWith("/trip_plan/")) {
          return <TripPlan localUser={localUser} />;
        }
        return null;
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

      <Header user={user} csrf={csrf} page={currentPage} setPage={goToPage} />
      {setDisplayPage()}
    </div>
  );
};

export default AppRoot;
