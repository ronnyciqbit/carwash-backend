import * as expressValidator from "express-validator";

import * as logger from "firebase-functions/logger";

import Transaction from "../models/clover/Transaction";
import Controller from "./Controller";

export default Controller.make({
  create: [
    expressValidator.checkSchema({}),
    async (req, res) => {
      try {
        await Transaction.create(req.body);

        res.status(201).send();
      } catch (error) {
        logger.error("(loopz) 'TrasactionController.create' failed", error);
        res.status(400).json(error);
      }
    },
  ],
});
