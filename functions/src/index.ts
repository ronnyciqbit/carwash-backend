import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import api from "./api";
import * as logger from "firebase-functions/logger";

import User from "./api/models/User";

admin.initializeApp();

export const assignRewardOnUserCreate = functions.database
  .ref("/users/{userId}")
  .onCreate(async (snapshot, context) => {
    const userId = context.params.userId;
    try {
      const user: User = snapshot.val();

      await User.reward(user);
    } catch (error) {
      logger.error(`Error assigning reward to user ${userId}:`, error);
    }
  });

// Set the timeout to 9 minutes (540 seconds)
exports.api = functions
  .runWith({timeoutSeconds: 540}) // Adjust the timeout here
  .https.onRequest(api);
