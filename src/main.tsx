import './instrument';
import React from "react";
import ReactDOM from "react-dom";
import { HashRouter } from "react-router-dom";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";
import { DeskproAppProvider } from "@deskpro/app-sdk";
import { StoreProvider } from "./context/StoreProvider";
import App from "./App";
import { Scrollbar } from "@deskpro/deskpro-ui";

import "flatpickr/dist/themes/light.css";
import "tippy.js/dist/tippy.css";
import "simplebar/dist/simplebar.min.css";
import "@deskpro/deskpro-ui/dist/deskpro-ui.css";
import "@deskpro/deskpro-ui/dist/deskpro-custom-icons.css";
import "./main.css";

TimeAgo.addDefaultLocale(en);

ReactDOM.render((
  <React.StrictMode>
    <Scrollbar style={{ height: "100%", width: "100%" }}>
      <DeskproAppProvider>
        <HashRouter>
          <StoreProvider>
            <App />
          </StoreProvider>
        </HashRouter>
      </DeskproAppProvider>
    </Scrollbar>
  </React.StrictMode>
), document.getElementById("root"));
