import { render } from 'react-dom';

import Newtab from './Newtab';
import './index.css';

import withBlerp from "../../withBlerp";

render(withBlerp({ Component: Newtab, pageProps: {} }), window.document.querySelector('#app-container'));

if (module.hot) module.hot.accept();
