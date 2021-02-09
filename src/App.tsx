import React from "react";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";
import { ProtectedRoute } from "src/components/Authentication/ProtectedRoute";
import Callback from "src/components/Authentication/Callback";
import Logout from "src/components/Authentication/Logout";
import NotFound from "src/pages/NotFound";
import Dashboard from "src/pages/Dashboard";

function App() {
  return (
    <Router>
      <Switch>
        <Route component={Callback} path="/callback" />
        <Route component={Logout} path="/logout" />
        <ProtectedRoute component={Dashboard} path="/" />
        <Route component={NotFound} />
      </Switch>
      ;
    </Router>
  );
}

export default App;
