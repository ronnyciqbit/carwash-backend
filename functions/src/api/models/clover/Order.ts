import axios from "axios";
import Customer from "./Customer";

import env from "../../../env.production";
import Merchant from "./Merchant";

type PaymentState =
  | "OPEN"
  | "PAID"
  | "REFUNDED"
  | "CREDITED"
  | "PARTIALLY_PAID"
  | "PARTIALLY_REFUNDED";

interface Customers {
  elements: Customer[];
}

interface OrderProperties {
  id: string;
  amount: number;
  customers: Customers;
  paymentState: PaymentState;
}

const client = axios.create({baseURL: env.clover.platform.baseUrl});

export default class Order implements OrderProperties {
  id: string;
  amount: number;
  customers: Customers;
  paymentState: PaymentState;

  constructor(orderData: OrderProperties) {
    this.id = orderData.id;
    this.amount = orderData.amount;
    this.customers = orderData.customers;
    this.paymentState = orderData.paymentState;
  }

  static async get(merchant: Merchant, id: string): Promise<Order> {
    const config = {
      headers: {Authorization: `Bearer ${merchant.platform.privateToken}`},
    };

    const response = await client.get(
      `/merchants/${merchant.id}/orders/${id}`,
      config
    );

    const data: OrderProperties = response.data;

    return new Order(data);
  }
}
