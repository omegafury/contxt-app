import contxtSdk from "src/services/sdkService";

const Logout: React.FC = () => {
  contxtSdk.auth.logOut();
  return <div>LOGGING OUT</div>;
};

export default Logout;
