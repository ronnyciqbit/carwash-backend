import Event from "./Event";
export type MerchantVariant = "B4F17D4K0J281" | "N2PTFKKAYYQ61";

export default interface Merchant {
  id: string;
  name: string;
  ecommerce: {
    publicToken: string;
    privateToken: string;
  };
  platform: {
    privateToken: string;
  };
}

export interface Merchants {
  [merchantId: string]: Event[];
}
