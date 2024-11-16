export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>;

import Merchant from "../api/models/clover/Merchant";

export interface Env {
  clover: {
    platform: {
      baseUrl: string;
    };
    ecommerce: {
      baseUrl: string;
    };
    merchants: Merchant[];
    appId: string;
    appSecret: string;
    loopz: {
      privateToken: string;
    };
  };
  firebase: {
    apiBaseUrl: string;
  };
}
