import { createRoot } from "react-dom/client";

import Options from "./Options";
import "./index.css";

import WithBlerp from "../../WithBlerp";

const container = document.getElementById("app-container");
const root = createRoot(container);
root.render(
    WithBlerp({ Component: Options, pageProps: { title: "Settings" } }),
);

if (module.hot) module.hot.accept();
