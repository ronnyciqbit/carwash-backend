import {Env} from "./interfaces/global";

const env: Env = {
  clover: {
    appId: "3DZ0WF67GMFQP",
    platform: {
      baseUrl: "https://api.clover.com",
    },
    ecommerce: {
      baseUrl: "https://scl.clover.com",
    },
    merchants: [
      {
        id: "B4F17D4K0J281",
        name: "MAGIC HANDS CAR WASH",
        ecommerce: {
          publicToken: "78acfd2ee0386bc44e905352aaa5a544",
          privateToken: "14bb3ebf-b43d-27b9-2e80-6840d8aaa3a1",
        },
        platform: {
          privateToken: "f536da38-5382-8674-8a05-a79703d1ece7",
        },
      },
      {
        id: "N2PTFKKAYYQ61",
        name: "Magic Hands Car Wash - 2",
        ecommerce: {
          publicToken: "",
          privateToken: "",
        },
        platform: {
          privateToken: "414a691c-ab8d-94ca-732c-82abf1d42263",
        },
      },
    ],
    appSecret: "cb25af2b-ac56-2149-b91e-d64a984cf2da",
    loopz: {
      privateToken: "8be20d61-9967-4218-a86e-36958519ac68",
    },
  },
  firebase: {
    apiBaseUrl: "https://us-central1-pre-car-wash.cloudfunctions.net/api",
  },
};

export default env;
