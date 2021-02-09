declare module "@ndustrial/contxt-sdk" {
  export type sdkConstructorOptions = {
    config: {
      auth: {
        clientId: String;
      };
      customModuleConfigs?: {
        contxtAuth?: {
          env: "production" | "development";
        };
        coordinator?: {
          env: "production" | "development";
        };
        iot?: {
          clientId: String;
          host: String;
        };
        iot_v2?: {
          clientId: String;
          host: String;
        };
      };
    };
    sessionType: String;
  };

  export type Facility = {
    id: number;
  };
  export type Feed = {};
  export type FeedDataRecord = {
    eventTime: string;
    value: string;
  };
  export type FeedData = {
    meta: {
      count: number;
      hasMore: boolean;
      limit: number;
      nextRecordTime: number;
      timeEnd: number;
      window: number;
    };
    records: FeedDataRecord[];
  };

  class ContxtSdk {
    constructor(options: sdkConstructorOptions);

    facilities: {
      getAll: () => Promise<Facility[]>;
    };
    iot: {
      feeds: {
        getByFacilityId: (facilityId: number) => Promise<Feed[]>;
      };
      outputs: {
        getFieldData: (
          outputId: number,
          fieldHumanName: String,
          options?: {}
        ) => Promise<FeedData>;
      };
    };
    auth: {
      isAuthenticated: () => boolean;
      handleAuthentication: () => void;
      logIn: () => void;
      logOut: () => void;
    };
  }

  export = ContxtSdk;
}
