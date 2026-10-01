import React, { useState, useEffect } from "react";
import Header from "./Header/Header";
import Home from "./Home/Home";
import Dashboard from "./Dashboard/Dashboard";
import TripPlan from "./TripPlan/TripPlan";
import ComingSoon from "./Home/Landing";
import { getConsumer } from "../utilities/cable";

import { Geyikbayiri } from "../../assets/images/Geyikbayiri.jpg";

import { UserSessionObject, Route, RouteList, AppRootProps } from "./types";

export const AppRoot: React.FC<AppRootProps> = ({
  user,
  localUser: initialLocalUser,
  csrf,
}) => {
  const [currentPage, setCurrentPage] = useState(window.location.pathname);
  const [localUser, setLocalUser] = useState(initialLocalUser);
  // Some pages (currently just TripPlan's trip editor and its full-page
  // "add a location" map step) need the whole viewport instead of being
  // squeezed into the normal max-w-md column below a sticky Header — they
  // tell us via onFullBleedChange rather than each faking it locally with
  // position:fixed (which fights any max-w we set here).
  const [fullBleed, setFullBleed] = useState(false);

  // Friendship changes (a sent invite being accepted/declined, etc.) are
  // pushed here regardless of which page is currently showing, since this
  // is the one place localUser lives for the whole SPA session — both
  // Dashboard/FriendsPanel and TripPlan/People read from it, and neither
  // re-fetches localUser on their own, so without this subscription the
  // only way to see a freshly-accepted friend is a full page reload.
  useEffect(() => {
    if (!localUser?.id) return;

    const subscription = getConsumer().subscriptions.create(
      { channel: "FriendshipsChannel" },
      {
        received: (data: any) =>
          setLocalUser((prev: any) => ({ ...prev, ...data })),
      },
    );

    return () => subscription.unsubscribe();
  }, [localUser?.id]);

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
        return (
          <TripPlan localUser={localUser} onFullBleedChange={setFullBleed} />
        );
      case "/home":
        return <Home localUser={localUser} />;
      case "/dashboard":
        return (
          <Dashboard
            user={user}
            localUser={localUser}
            onLocalUserUpdate={(updated: any) =>
              setLocalUser((prev: any) => ({ ...prev, ...updated }))
            }
          />
        );
      case "/trip_plan":
        return (
          <TripPlan localUser={localUser} onFullBleedChange={setFullBleed} />
        );
      default:
        if (currentPage.startsWith("/trip_plan/")) {
          return (
            <TripPlan
              localUser={localUser}
              onFullBleedChange={setFullBleed}
            />
          );
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

      {!fullBleed && (
        <Header user={user} csrf={csrf} page={currentPage} setPage={goToPage} />
      )}
      <div
        className={
          fullBleed ? "h-full w-full" : "flex max-w-md mx-auto"
        }
      >
        {setDisplayPage()}
      </div>
    </div>
  );
};

export default AppRoot;
