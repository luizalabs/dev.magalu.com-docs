import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import Login from "./components/pages/Login";
import InitialClient from "./components/pages/InitialClient";
import ClientsOrder from "./components/pages/ClientsOrder";
import ErrorPage from "./components/pages/Error";
import { PrivateRoute } from "./utils/PrivateRoute";
import "./App.css";

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Login} />
        <PrivateRoute path="/client" component={InitialClient} />
        <PrivateRoute path="/error" component={ErrorPage} />
        <PrivateRoute path="/client-order" component={ClientsOrder} />
      </Switch>
    </Router>
  );
}

export default App;
