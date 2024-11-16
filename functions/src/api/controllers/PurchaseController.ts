import * as admin from "firebase-admin";
import * as expressValidator from "express-validator";

import * as logger from "firebase-functions/logger";

import Controller from "./Controller";
import Purchase from "../models/Purchase";
import Plan from "../models/Plan";

import CloverCharge from "../models/clover/Charge";

import moment from "moment";

export default Controller.make({
  create: [
    expressValidator.checkSchema(
      {
        plan: {isObject: true},
        cardToken: {isString: true},
      },
      ["body"]
    ),
    async (req, res) => {
      try {
        const authorizationHeader = req.headers.authorization as string; // header validated in middleware
        const bearer = authorizationHeader.split(" ")[1];

        const decoded = await admin.auth().verifyIdToken(bearer);

        const uid = decoded.uid;

        const cardToken = req.body.cardToken;
        const plan: Plan = req.body.plan;

        await CloverCharge.create({
          amount: plan.price * 100,
          currency: "usd",
          source: cardToken,
        });

        // create purchase record (firebase)

        const planDurationDays = plan.durationDays;
        const currentDate = moment();

        const startDate = currentDate.format("YYYY-MM-DD");

        const endDate = currentDate
          .add(planDurationDays, "days")
          .format("YYYY-MM-DD");

        const purchase = new Purchase({
          comments: "",
          giftCardCode: "", // todo: not necesary anymore remove in front also
          startDate,
          endDate,
          plan: plan.slug,
          price: plan.price,
          users: [uid],
          remainingNumber: plan.servicesNumber,
          selectedPaymentType: "",
          slug: plan.slug,
          vehicleType: "",
        });

        await Purchase.create(uid, purchase);

        res.status(201).send({purchase});
      } catch (error) {
        logger.error(error);
        res.status(500).json(error);
      }
    },
  ],
});
