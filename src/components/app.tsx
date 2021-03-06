
import store from "../store/chrome-store";
import * as React from "react";
import {Provider} from "react-redux";

import Layout from "./layout";
import Modal from "./modal";

const REDUX_DEVTOOLS_ENABLED = process.env.REDUX_DEVTOOLS === "1";

let devTools: JSX.Element;
if (REDUX_DEVTOOLS_ENABLED) {
  const DevTools = require("./dev-tools").default;
  devTools = <DevTools/>;
}

export default class App extends React.Component<void, void> {
  render () {
    return <Provider store={store}>
      <div>
        <Layout/>
        <Modal/>
        {devTools}
      </div>
    </Provider>;
  }
}
