import React from "react";
import { Route, RouteProps } from "react-router-dom";
import contxtSdk from "src/services/sdkService";

const ProtectedRoute: React.FC<RouteProps> = (props) => {
  if (!contxtSdk.auth.isAuthenticated() && props.location) {
    localStorage.setItem(
      "redirect_pathname",
      `${props.location.pathname}${props.location.search}`
    );

    contxtSdk.auth.logIn();

    return null;
  }

  return <Route {...props} />;
};

export { ProtectedRoute };
export default ProtectedRoute;
