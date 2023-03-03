import { render } from "react-dom";

import Newtab from "./Newtab";
import "./index.css";

import WithBlerp from "../../WithBlerp";

render(
    WithBlerp({ Component: Newtab, pageProps: {} }),
    window.document.querySelector("#app-container"),
);

if (module.hot) module.hot.accept();
