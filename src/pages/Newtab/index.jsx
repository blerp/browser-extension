import { createRoot } from "react-dom";

import Newtab from "./Newtab";
import "./index.css";

import WithBlerp from "../../WithBlerp";

const container = document.getElementById("app-container");
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(WithBlerp({ Component: Newtab, pageProps: {} }));

if (module.hot) module.hot.accept();
