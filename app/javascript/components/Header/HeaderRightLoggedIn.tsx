import React from "react";

export const HeaderRightLoggedIn = ({ user, csrf, setPage }) => {
  return (
    <>
      <form
        className="button_to m-2 flex items-center justify-end flex-none"
        method="get"
        action="/auth/logout"
      >
        <button
          className="bg-auburn p-2 m-2 w-12 h-12 flex items-center justify-center text-xs"
          data-turbo="false"
          type="submit"
        >
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
        className="h-full w-auto mr-2 cursor-pointer flex-none"
        onClick={() => setPage("/dashboard")}
      >
        <img className="h-12 w-auto" src={user.picture}></img>
      </button>
    </>
  );
};

export default HeaderRightLoggedIn;
