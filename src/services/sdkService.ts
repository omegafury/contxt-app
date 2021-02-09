import ContxtSdk from "@ndustrial/contxt-sdk";

const contxtSdk = new ContxtSdk({
  config: {
    auth: {
      clientId: process.env.REACT_APP_CLIENT_ID as String,
    },
  },
  sessionType: "auth0WebAuth",
});

export default contxtSdk;
