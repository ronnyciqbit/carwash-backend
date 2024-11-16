import * as expressValidator from "express-validator";
import * as admin from "firebase-admin";

import * as logger from "firebase-functions/logger";

import Controller from "./Controller";

import GiftCard from "../models/clover/GiftCard";
import {Merchants} from "../models/clover/Merchant";
import Order from "../models/clover/Order";
import User from "../models/User";

import env from "../../env.production";

export default Controller.make({
  create: [
    expressValidator.checkSchema({email: {isString: true}}, ["body"]),
    async (req, res) => {
      try {
        const authorizationHeader = req.headers.authorization as string; // header validated in middleware
        const bearer = authorizationHeader.split(" ")[1];

        const decoded = await admin.auth().verifyIdToken(bearer);

        const email = decoded.email as string; // email validated in authentication phase

        const card = await GiftCard.Attempt.create(email);

        res.status(201).send(card);
      } catch (error) {
        logger.error(error);
        res.status(500).json(error);
      }
    },
  ],
  show: [
    expressValidator.checkSchema({code: {isString: true}}, ["params"]),
    async (req, res) => {
      try {
        const code = req.params.code;

        const giftCard = await GiftCard.Record.get(code);

        res.status(201).send(giftCard);
      } catch (error) {
        logger.error("GiftCard.Record.get error", error);
        res.status(500).send(error);
      }
    },
  ],
  issue: [
    expressValidator.checkSchema({}, []),
    async (req, res) => {
      try {
        const message = req.body;

        const merchants: Merchants = message.merchants;

        const elements = [];

        // eslint-disable-next-line guard-for-in
        for (const merchantId in merchants) {
          const events = merchants[merchantId];

          for (const event of events) {
            const [type, orderId] = event.objectId.split(":");

            // keep this validation to prevent errors if someone enables other types of events from the clover dashboard
            if (type === "O") {
              const merchant = env.clover.merchants.find(
                (item) => item.id === merchantId
              );

              if (!merchant) {
                throw new Error(
                  `Merchant ${merchantId} not supported for this event`
                );
              }

              const order = await Order.get(merchant, orderId);

              if (order.paymentState === "PAID") {
                const reward = order.amount / 10;
                const users: User[] = [];

                for (const customer of order.customers?.elements || []) {
                  try {
                    const user = await User.find("customerId", customer.id);
                    users.push(user);
                  } catch (error) {
                    continue;
                  }
                }

                for (const user of users) {
                  await GiftCard.Record.increment(
                    user.code,
                    reward / users.length
                  );
                  elements.push({user, reward});
                }
              }
            }
          }
        }

        res.status(200).send(elements);
      } catch (error) {
        logger.error("Colver event failed", error);
        res.status(500).send();
      }
    },
  ],
  provisional: [
    expressValidator.checkSchema({}, []),
    async (req, res) => {
      try {
        const message = req.body;

        const merchants: Merchants = message.merchants;

        const elements = [];

        // eslint-disable-next-line guard-for-in
        for (const merchantId in merchants) {
          const events = merchants[merchantId];

          for (const event of events) {
            const [type, orderId] = event.objectId.split(":");

            // keep this validation to prevent errors if someone enables other types of events from the clover dashboard
            if (type === "O") {
              const merchant = env.clover.merchants.find(
                (item) => item.id === merchantId
              );

              if (!merchant) {
                throw new Error(
                  `Merchant ${merchantId} not supported for this event`
                );
              }

              const order = await Order.get(merchant, orderId);

              if (order.paymentState === "PAID") {
                const reward = order.amount / 10;
                const users: User[] = [];

                for (const customer of order.customers?.elements || []) {
                  try {
                    const user = await User.find("customerId", customer.id);
                    users.push(user);
                  } catch (error) {
                    continue;
                  }
                }

                for (const user of users) {
                  await GiftCard.Record.increment(
                    user.code,
                    reward / users.length
                  );
                  elements.push({user, reward});
                }
              }
            }
          }
        }

        res.status(200).send(elements);
      } catch (error) {
        logger.error("Colver event failed", error);
        res.status(500).send();
      }
    },
  ],
  welcome: [
    expressValidator.checkSchema({}, ["headers"]),
    async (_, res) => {
      res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Carwash Web Service</title>
        </head>
        <body>
            <h1>Welcome to the Carwash Web Service</h1>
        </body>
        </html>
      `);
    },
  ],
});
