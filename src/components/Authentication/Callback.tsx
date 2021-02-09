import contxtSdk from "src/services/sdkService";
import { useEffect } from "react";

const AuthenticationCallback: React.FC = () => {
  useEffect(() => {
    contxtSdk.auth.handleAuthentication();
  });

  return <div>LOADING LOADING LOADING</div>;
};

export default AuthenticationCallback;
