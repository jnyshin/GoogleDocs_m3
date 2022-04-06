import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Editor from "./Editor";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { v4 as uuidV4 } from "uuid";
ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Switch>
        <Route path="/" exact>
          <Editor id={uuidV4()} />
        </Route>
        <Route path="/connect/:id">
          <Editor />
        </Route>
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);
