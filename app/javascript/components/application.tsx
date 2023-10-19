import * as React from "react";
import * as ReactDOM from "react-dom";

import AppRoot from "./AppRoot";

document.addEventListener("DOMContentLoaded", () => {
  const rootEl = document.getElementById("data_div");
  const routes = rootEl && rootEl.getAttribute("data-routes");
  ReactDOM.render(<AppRoot routes={routes || ""} />, rootEl);
});
