import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Editor from "./Editor";
import Signup from "./Signup";
import Login from "./Login";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import DocsList from "./DocsList";
import Home from "./Home";

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Switch>
        <Route path="/collection/list" exact>
          <DocsList />
        </Route>
        <Route path="/doc/edit/:docId/">
          <Editor />
        </Route>
        <Route path="/users/signup" exact>
          <Signup />
        </Route>
        <Route path="/users/login" exact>
          <Login />
        </Route>
        <Route path="/home" exact>
          <Home />
        </Route>
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);
