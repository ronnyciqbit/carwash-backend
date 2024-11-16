import axios from "axios";
import * as logger from "firebase-functions/logger";
import {Optional} from "../../../interfaces/global";
import Merchant from "./Merchant";

interface EmailAddresses {
  elements: EmailAddress[];
}

interface CustomerProperties {
  id?: string;
  emailAddresses: EmailAddresses;
  firstName: string;
  lastName: string;
}

interface EmailAddress {
  emailAddress: string;
  primaryEmail: boolean;
}

const client = axios.create({baseURL: "https://api.clover.com"});

export default class Customer implements CustomerProperties {
  id: string;
  emailAddresses: EmailAddresses;
  firstName: string;
  lastName: string;

  constructor(
    id: string,
    emailAddresses: EmailAddresses,
    firstName: string,
    lastName: string
  ) {
    this.id = id;
    this.emailAddresses = emailAddresses;
    this.firstName = firstName;
    this.lastName = lastName;
  }

  static async create(
    merchant: Merchant,
    customer: Optional<Customer, "id" | "firstName" | "lastName">
  ) {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${merchant.platform.privateToken}`,
        },
      };

      const response = await client.post(
        `/v3/merchants/${merchant.id}/customers`,
        customer,
        config
      );

      return response.data as Customer;
    } catch (error) {
      logger.error("Customer.create failed", error);
      throw error;
    }
  }

  static async get(id: string, merchantId: string) {
    const response = await client.get(
      `/v3/merchants/${merchantId}/customers/${id}?expand=emailAddresses`
    );

    const customer: Customer = response.data;

    return customer;
  }
}
