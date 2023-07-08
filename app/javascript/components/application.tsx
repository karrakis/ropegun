import * as React from "react";
import * as ReactDOM from "react-dom";

import AppRoot from "./AppRoot"

document.addEventListener("DOMContentLoaded", () => {
  const rootEl = document.getElementById("root");
  ReactDOM.render(<AppRoot />, rootEl);
});