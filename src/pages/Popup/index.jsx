// import React from 'react';
// import { createRoot } from 'react-dom/client';

import Popup from "./Popup";
import "./index.css";

// const container = document.getElementById('app-container');
// const root = createRoot(container); // createRoot(container!) if you use TypeScript
// root.render(<Popup />);

import { render } from "react-dom";
import "./index.css";

import withBlerp from "../../withBlerp";

render(
    withBlerp({ Component: Popup, pageProps: {} }),
    window.document.querySelector("#app-container"),
);

if (module.hot) module.hot.accept();
