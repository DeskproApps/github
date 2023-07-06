import React from "react";
import ReactDOM from "react-dom";
import { HashRouter } from "react-router-dom";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";
import { DeskproAppProvider } from "@deskpro/app-sdk";
import { StoreProvider } from "./context/StoreProvider";
import App from "./App";

import "iframe-resizer/js/iframeResizer.contentWindow.js";
import "flatpickr/dist/themes/light.css";
import "tippy.js/dist/tippy.css";
import "simplebar/dist/simplebar.min.css";

import "@deskpro/deskpro-ui/dist/deskpro-ui.css";
import "@deskpro/deskpro-ui/dist/deskpro-custom-icons.css";

TimeAgo.addDefaultLocale(en);

ReactDOM.render((
    <React.StrictMode>
        <DeskproAppProvider>
            <HashRouter>
                <StoreProvider>
                    <App/>
                </StoreProvider>
            </HashRouter>
        </DeskproAppProvider>
    </React.StrictMode>
), document.getElementById("root"));
