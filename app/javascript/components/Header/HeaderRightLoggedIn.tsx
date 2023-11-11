import React from "react";

export const HeaderRightLoggedIn = ({ user, dashboard_path, csrf }) => {
  return (
    <form
      className="button_to m-2 flex items-center justify-end"
      method="get"
      action="/auth/logout"
    >
      <button className="p-2 h-12 bg-auburn" data-turbo="false" type="submit">
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
        href={dashboard_path}
      >
        <img className="h-12 w-auto" src={user.picture}></img>
      </a>
    </form>
  );
};

export default HeaderRightLoggedIn;
