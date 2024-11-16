import * as expressValidator from "express-validator";
import admin from "firebase-admin";

import Customer from "../models/clover/Customer";
import Controller from "./Controller";

import env from "../../env.production";

import moment from "moment";
import Purchase from "../models/Purchase";
import User from "../models/User";
import GiftCard from "../models/clover/GiftCard";

import backup from "../resources/users-pre.json";
import Plan from "../models/Plan";

export default Controller.make({
  batchReward: [
    expressValidator.checkSchema({}),
    async (_, res) => {
      // try {
      const db = admin.database(); // Get reference to Firebase Realtime Database
      const usersRef = db.ref("/users"); // Reference to users path

      // Fetch all users from the /users path
      const snapshot = await usersRef.once("value");

      if (!snapshot.exists()) {
        res.status(404).json({message: "No users found."});
      }

      const users = snapshot.val();

      const failed = [];

      for (const userId of Object.keys(users)) {
        const user: User = users[userId];

        const email = user.email;
        const uid = user.uid;

        if (!user.code && !user.customerId) {
          const plan = {
            index: 2,
            active: true,
            color: "#926f14",
            created: "2023-05-08T22:18:38.640Z",
            description_en: "no supreme carwashes",
            description_es: "sin lavadas supreme",
            durationDays: 365,
            image:
              // eslint-disable-next-line max-len
              "https://firebasestorage.googleapis.com/v0/b/pre-car-wash.appspot.com/o/plan-icons%2FCarICONS-07.png?alt=media&token=33612cd1-89c4-4a4c-abcb-00d766cb9cec",
            maxUsers: 3,
            maxVehicles: 3,
            name_en: "FREE MEMBERSHIP",
            name_es: "MEMBRESÍA GRATUITA",
            price: 0,
            prices: [
              {
                id: "small",
                price: 200,
              },
            ],
            purchaseDateEnd: "2025-12-31",
            purchaseDateStart: "2024-01-01",
            servicesNumber: 0,
            slug: "free-membership2024-01-08",
            plan: "free-membership2024-01-08",
            updated: "2024-01-19T16:45:44.335Z",
          };

          try {
            const card = await GiftCard.Attempt.create(email);

            // create customer record (clover)

            const customer = await Customer.create(env.clover.merchants[0], {
              emailAddresses: {
                elements: [{emailAddress: email, primaryEmail: true}],
              },
            });

            await Customer.create(env.clover.merchants[1], {
              id: customer.id,
              emailAddresses: {
                elements: [{emailAddress: email, primaryEmail: true}],
              },
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
              giftCardCode: card.code,
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

            // User
            await User.update(uid, {customerId: customer.id, code: card.code});
          } catch (error) {
            failed.push({email, uid, plan, user});
            continue;
          }
        }
      }

      res.status(200).json({failed});
    },
  ],
  count: [
    expressValidator.checkSchema({}),
    async (_, res) => {
      try {
        const db = admin.database(); // Get reference to Firebase Realtime Database
        const usersRef = db.ref("/users"); // Reference to users path

        // Retrieve data from users path
        usersRef.once("value", (snapshot) => {
          const usersData = snapshot.val();

          const records = Object.keys(usersData).filter(
            (userId) => usersData[userId].code
          );

          // Count users that have the 'code' field only
          const userCountWithCode = usersData ? records.length : 0;

          // Send the user count as response
          res.status(200).json({count: userCountWithCode});
        });
      } catch (error) {
        // Handle error
        console.error("Error retrieving user count:", error);
        res.status(500).json({error: "Failed to retrieve user count"});
      }
    },
  ],
  clear: [
    expressValidator.checkSchema({}),
    async (_, res) => {
      try {
        const db = admin.database(); // Get reference to Firebase Realtime Database
        const usersRef = db.ref("/users"); // Reference to users path

        // Fetch all users from the /users path
        const snapshot = await usersRef.once("value");

        if (!snapshot.exists()) {
          res.status(404).json({message: "No users found."});
        }

        const users = snapshot.val(); // Retrieve users data

        // Logging for debugging purposes
        console.log("Users data:", users);

        // Perform individual updates for each user using `.child()`
        await Promise.all(
          Object.keys(users).map(async (userId) => {
            console.log(`Removing purchaseActive field for user: ${userId}`);
            await usersRef.child(userId).update({purchaseActive: null});
          })
        );

        res
          .status(200)
          .json({message: "purchaseActive field removed from all users."});
      } catch (error) {
        console.error("Error updating users:", error);
        res.status(500).json({message: "Internal server error."});
      }
    },
  ],
  undo: [
    expressValidator.checkSchema({}),
    async (_, res) => {
      try {
        const db = admin.database(); // Get reference to Firebase Realtime Database
        const usersRef = db.ref("/users"); // Reference to users path

        // Fetch all users from the /users path
        const snapshot = await usersRef.once("value");

        if (!snapshot.exists()) {
          res.status(404).json({message: "No users found."});
        }

        const users = snapshot.val(); // Retrieve users data

        // Logging for debugging purposes
        console.log("Users data from Firebase:", users);

        const failed = [];

        // Perform individual updates for each user using `.child()`
        for (const userId of Object.keys(users)) {
          try {
            const originalData = (backup as any)[userId];
            if (originalData && originalData.purchaseActive !== undefined) {
              console.log(`Restoring purchaseActive field for user: ${userId}`);
              await usersRef
                .child(userId)
                .update({purchaseActive: originalData.purchaseActive});
            }
          } catch (error) {
            failed.push((backup as any)[userId]);
          }
        }

        res.status(200).json({
          message: "purchaseActive field restored for all applicable users.",
          failed,
        });
      } catch (error) {
        console.error("undo failed:", error);
        res.status(500).json({message: JSON.stringify(error)});
      }
    },
  ],
  purchase: [
    expressValidator.checkSchema(
      {email: {isString: true}, planId: {isString: true}},
      ["body"]
    ),
    async (req, res) => {
      try {
        // create purchase record (firebase)
        const email = req.body.email;
        const planId = req.body.planId;

        const user = await User.find("email", email);
        const plan = await Plan.show(planId);

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
          users: [user.uid],
          remainingNumber: plan.servicesNumber,
          selectedPaymentType: "",
          slug: plan.slug,
          vehicleType: "",
        });

        await Purchase.create(user.uid, purchase);

        res.status(200).json({
          message: `purchase of product: ${planId} created for user: ${email}`,
        });
      } catch (error) {
        console.error("Error updating users:", error);
        res.status(500).json({message: "Internal server error."});
      }
    },
  ],
});
