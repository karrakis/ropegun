import React from "react";
import Logo from "./Logo";
import HeaderRightLoggedIn from "./HeaderRightLoggedIn";
import HeaderRightLoggedOut from "./HeaderRightLoggedOut";

export const Header = ({ user, csrf, dashboard_path }) => {
  return (
    <div className="text-white h-16 w-full flex items-center sticky top-0 z-50 bg-night text-cream">
      <Logo />
      <div id="header-right" className="justify-end flex w-full h-full">
        {!!user && (
          <HeaderRightLoggedIn
            user={user}
            csrf={csrf}
            dashboard_path={dashboard_path}
          />
        )}
        {!user && <HeaderRightLoggedOut csrf={csrf} />}
      </div>
    </div>
  );
};

export default Header;
