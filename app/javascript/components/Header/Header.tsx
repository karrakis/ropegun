import React from "react";
import HeaderLeft from "./HeaderLeft";
import HeaderRightLoggedIn from "./HeaderRightLoggedIn";
import HeaderRightLoggedOut from "./HeaderRightLoggedOut";

export const Header = ({ user, csrf, setPage }) => {
  return (
    <div className="text-white h-16 w-full flex items-center sticky top-0 z-50 bg-night text-cream">
      <HeaderLeft setPage={setPage} />
      <div id="header-right" className="justify-end flex w-full h-full">
        {!!user && (
          <HeaderRightLoggedIn user={user} csrf={csrf} setPage={setPage} />
        )}
        {!user && <HeaderRightLoggedOut csrf={csrf} />}
      </div>
    </div>
  );
};

export default Header;
