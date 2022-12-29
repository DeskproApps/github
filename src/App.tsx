import { HashRouter } from "react-router-dom";
import { DeskproAppProvider } from "@deskpro/app-sdk";
import { StoreProvider } from "./context/StoreProvider";
import { Main } from "./pages/Main";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";
import "./App.css";

import "iframe-resizer/js/iframeResizer.contentWindow.js";
import "flatpickr/dist/themes/light.css";
import "tippy.js/dist/tippy.css";
import "simplebar/dist/simplebar.min.css";

import "@deskpro/deskpro-ui/dist/deskpro-ui.css";
import "@deskpro/deskpro-ui/dist/deskpro-custom-icons.css";

TimeAgo.addDefaultLocale(en);

function App() {
    return (
        <DeskproAppProvider>
            <HashRouter>
                <StoreProvider>
                    <Main/>
                </StoreProvider>
            </HashRouter>
        </DeskproAppProvider>
    );
}

export default App;
