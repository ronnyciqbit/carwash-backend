import axios from "axios";
import * as logger from "firebase-functions/logger";

interface ChargeProperties {
  amount: number;
  currency: string;
  source: string;
}

const CLOVER_ECOMMERCE_PRIVATE_TOKEN = "14bb3ebf-b43d-27b9-2e80-6840d8aaa3a1";

export default class Charge implements ChargeProperties {
  amount: number;
  currency: string;
  source: string;

  constructor({amount, currency, source}: Charge) {
    this.amount = amount;
    this.currency = currency;
    this.source = source;
  }

  static async create(payment: Charge) {
    try {
      await axios.post("https://scl.clover.com/v1/charges", payment, {
        headers: {
          Authorization: `Bearer ${CLOVER_ECOMMERCE_PRIVATE_TOKEN}`,
        },
      });
    } catch (error) {
      logger.error("'Charge.create' failed");
      throw error;
    }
  }
}
