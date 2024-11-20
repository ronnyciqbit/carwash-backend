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
      await axios.post(
        "https://scl.clover.com/v1/charges",
        {
          ecomind: "ecom",
          metadata: {
            existingDebtIndicator: false,
          },
          source: payment.source,
          amount: payment.amount,
          currency: payment.currency,
        },
        {
          headers: {
            Authorization: `Bearer ${CLOVER_ECOMMERCE_PRIVATE_TOKEN}`,
          },
        }
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(
        "'Charge.create' failed, (stringified):",
        JSON.stringify(error)
      );
      throw error;
    }
  }
}
