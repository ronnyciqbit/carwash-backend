import * as expressValidator from "express-validator";

import * as logger from "firebase-functions/logger";

import Plan from "../models/Plan";
import Controller from "./Controller";

export default Controller.make({
  show: [
    expressValidator.checkSchema({
      slug: {
        in: ["params"],
        errorMessage: "plan missing",
        isString: true,
      },
    }),
    async (req, res) => {
      try {
        const slug = req.params.slug;

        const plan = await Plan.show(slug);

        res.status(201).send(plan);
      } catch (error) {
        logger.error(error);
        res.status(400).json(error);
      }
    },
  ],
});
