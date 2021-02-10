import ContxtSdk from "@ndustrial/contxt-sdk";

const contxtSdk = new ContxtSdk({
  config: {
    auth: {
      clientId: "nC2Tp9H45CBmBzX60eH3A3psGqE2K1KA",
    },
  },
  sessionType: "auth0WebAuth",
});

export default contxtSdk;
