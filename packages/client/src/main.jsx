import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Editor from "./Editor";
import Signup from "./Signup";
import Login from "./Login";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Home from "./Home";
import Test from "./Test";

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Switch>
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
        <Route path="/test" exact>
          <Test />
        </Route>
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);
