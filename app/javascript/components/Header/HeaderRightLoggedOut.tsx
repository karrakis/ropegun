import React from "react";

export const HeaderRightLoggedOut = ({ csrf }) => {
  return (
    <form className="button_to m-2" method="post" action="/auth/auth0">
      <button className="bg-auburn p-2 m-2" data-turbo="false" type="submit">
        Login
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

export default HeaderRightLoggedOut