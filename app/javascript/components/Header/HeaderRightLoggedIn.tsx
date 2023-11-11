import React from "react";

export const HeaderRightLoggedIn = ({ user, csrf, setPage }) => {
  return (
    <>
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
      </form>
      <button
        data-turbo="false"
        className="h-full w-auto mr-2 cursor-pointer"
        onClick={() => setPage("/dashboard")}
      >
        <img className="h-12 w-auto" src={user.picture}></img>
      </button>
    </>
  );
};

export default HeaderRightLoggedIn;
