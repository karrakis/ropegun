import * as React from "react";
import * as ReactDOM from "react-dom";

import AppRoot from "./AppRoot";

document.addEventListener("DOMContentLoaded", () => {
  const rootEl = document.getElementById("data_div");
  const routes =
    rootEl && JSON.parse(rootEl.getAttribute("data-routes") || false);
  const user = rootEl && JSON.parse(rootEl.getAttribute("data-user") || false);
  ReactDOM.render(<AppRoot routes={routes || ""} user={user} />, rootEl);
});
