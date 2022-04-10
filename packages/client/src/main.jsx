import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Editor from "./Editor";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import DocsList from "./DocsList";
ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Switch>
        <Route path="/" exact>
          <DocsList />
        </Route>
        <Route path="/showdoc/:docId/:id">
          <Editor />
        </Route>
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);
