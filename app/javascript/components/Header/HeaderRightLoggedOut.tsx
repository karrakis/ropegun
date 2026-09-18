import React from "react";

export const HeaderRightLoggedOut = ({ csrf }) => {
  return (
    <form className="button_to" method="post" action="/auth/auth0">
      <button
        className="bg-auburn p-2 m-2 w-12 h-12 flex items-center justify-center text-xs"
        data-turbo="false"
        type="submit"
      >
        Log&nbsp;In
      </button>
      <input
        type="hidden"
        name="authenticity_token"
        value={csrf}
        autoComplete="off"
      ></input>
    </form>
  );
};

export default HeaderRightLoggedOut;
