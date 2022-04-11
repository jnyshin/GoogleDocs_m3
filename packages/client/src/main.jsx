import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Editor from "./Editor";
import Signup from "./Signup";
import Login from "./Login";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import DocsList from "./DocsList";
import { v4 as uuidV4 } from "uuid";
ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Switch>
        <Route path="/collection/list" exact>
          <DocsList />
        </Route>
        <Route path="/doc/edit/:docId/:id">
          <Editor />
        </Route>
        <Route path="/users/signup" exact>
          <Signup />
        </Route>
        <Route path="/users/login" exact>
          <Login />
        </Route>
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);
