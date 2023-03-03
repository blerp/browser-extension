// import React from 'react';
// import { createRoot } from 'react-dom/client';

import Popup from "./Popup";
import "./index.css";
import { createRoot } from "react-dom/client";

import WithBlerp from "../../WithBlerp";

const container = document.getElementById("app-container");
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(WithBlerp({ Component: Popup, pageProps: {} }));

if (module.hot) module.hot.accept();
