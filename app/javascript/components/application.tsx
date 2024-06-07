import * as React from "react";
import * as ReactDOM from "react-dom";

import AppRoot from "./AppRoot";

document.addEventListener("DOMContentLoaded", () => {
  const rootEl = document.getElementById("data_div");
  const routes =
    rootEl && JSON.parse(rootEl.getAttribute("data-routes") || false);
  const user = rootEl && JSON.parse(rootEl.getAttribute("data-user") || false);
  const local_user =
    rootEl && JSON.parse(rootEl.getAttribute("data-local-user") || false);

  const userSavedLocations =
    rootEl && JSON.parse(rootEl.getAttribute("data-locations") || false);

  console.log("application.tsx userSavedLocation:", userSavedLocations);

  const csrf = document
    .querySelector("meta[name='csrf-token']")!
    .getAttribute("content");

  ReactDOM.render(
    <AppRoot
      routes={routes || ""}
      user={user}
      localUser={local_user}
      userSavedLocations={userSavedLocations || []}
      csrf={csrf || ""}
    />,
    rootEl
  );
});
