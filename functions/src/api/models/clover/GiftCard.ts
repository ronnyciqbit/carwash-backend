import axios from "axios";
import * as logger from "firebase-functions/logger";

import {v4 as uuidv4} from "uuid";

import env from "../../../env.production";

const client = axios.create({
  baseURL: "https://api.loopz.io/v1/public",
  headers: {
    Authorization: `Bearer ${env.clover.loopz.privateToken}`,
  },
});

interface FoundingSource {
  amount: {
    currencyCode: string;
    amount: number; // cents
  };
  type: string;
  reason: string;
}

interface AttemptProperties {
  amount: number;
  funding_source: FoundingSource;
  type: string;
  idempotency_key: string;
  notify_sender: boolean;
  notify_recipient: boolean;
  recipient_email: string;
}

class Attempt implements AttemptProperties {
  amount: number; // cents
  funding_source: FoundingSource;
  type: string;
  idempotency_key: string;
  notify_sender: boolean;
  notify_recipient: boolean;
  recipient_email: string;

  constructor(fields: Attempt) {
    this.amount = fields.amount;
    this.funding_source = fields.funding_source;
    this.type = fields.type;
    this.idempotency_key = fields.idempotency_key;
    this.notify_sender = fields.notify_sender;
    this.notify_recipient = fields.notify_recipient;
    this.recipient_email = fields.recipient_email;
  }

  static async create(email: string) {
    try {
      const response = await client.post("/gift-cards", {
        amount: 0,
        funding_source: {
          amount: {
            currencyCode: "USD",
            amount: 0,
          },
          type: "STORE_CREDIT",
          reason: "rewards",
        },
        type: "DIGITAL",
        idempotency_key: uuidv4(),
        notify_sender: false,
        notify_recipient: false,
        recipient_email: email,
      });

      return response.data.gift_card as Record;
    } catch (error) {
      logger.error("(loopz) 'GiftCard.create' failed", error);
      throw error;
    }
  }
}

interface RecordProperties {
  id: string;
  code: string;
  gan: string;
  balance: {
    amount: number;
    currencyCode: string;
  };
  type: string;
  front_design_image_url: string;
  back_design_image_url: string;
  created_on: string;
  updated_on: string;
  recipient_name: string;
  recipient_email: string;
  funding_source: {
    id: string;
    type: string;
    payment_details: {
      type: string;
      reason: string;
    };
  };
}

class Record implements RecordProperties {
  id: string;
  code: string;
  gan: string;
  balance: {
    amount: number;
    currencyCode: string;
  };
  type: string;
  front_design_image_url: string;
  back_design_image_url: string;
  created_on: string;
  updated_on: string;
  recipient_name: string;
  recipient_email: string;
  funding_source: {
    id: string;
    type: string;
    payment_details: {
      type: string;
      reason: string;
    };
  };

  constructor(record: Record) {
    this.id = record.id;
    this.code = record.code;
    this.gan = record.gan;
    this.balance = {
      amount: record.balance.amount,
      currencyCode: record.balance.currencyCode,
    };
    this.type = record.type;
    this.front_design_image_url = record.front_design_image_url;
    this.back_design_image_url = record.back_design_image_url;
    this.created_on = record.created_on;
    this.updated_on = record.updated_on;
    this.recipient_name = record.recipient_name;
    this.recipient_email = record.recipient_email;
    this.funding_source = {
      id: record.funding_source.id,
      type: record.funding_source.type,
      payment_details: {
        type: record.funding_source.payment_details.type,
        reason: record.funding_source.payment_details.reason,
      },
    };
  }

  static async increment(code: string, amount: number) {
    try {
      await client.post(`/gift-cards/${code}/adjust-balance`, {
        action: "INCREMENT",
        amount,
        type: "DIGITAL",
        idempotency_key: uuidv4(),
        reason: "COMPLIMENTARY",
      });
    } catch (error) {
      logger.error("(loopz) 'GiftCard.increment' failed", error);
      throw error;
    }
  }

  static async get(code: string) {
    const response = await client.get(`/gift-cards/${code}`);

    return response.data;
  }
}

export default {Attempt, Record};
