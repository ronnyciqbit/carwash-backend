import cors from "cors";
import express from "express";

import PurchasesController from "./controllers/PurchaseController";
import {authenticate} from "./middlewares/auth";
import PlanController from "./controllers/PlanController";
import GiftCardController from "./controllers/GiftCardController";
import TransactionController from "./controllers/TransactionController";
import UsersController from "./controllers/UsersController";

const api = express();

api.use(cors({origin: true}));

// purchases

api.post("/purchases", authenticate, ...PurchasesController.create);
api.get("/plans/:slug", authenticate, ...PlanController.show);

// gift card

api.post("/gift-cards", authenticate, ...GiftCardController.create);
api.post("/gift-cards/issue", ...GiftCardController.issue);
api.post("/gift-cards/provisional", ...GiftCardController.provisional);
api.get("/gift-cards/:code", authenticate, ...GiftCardController.show);

// admin (provisional) // todo: remove provisionals
api.post("/admin/users/batch-rewards", ...UsersController.batchReward);
api.get("/admin/users-count", ...UsersController.count);
api.get("/admin/users-clear", ...UsersController.clear);
api.get("/admin/users-undo", ...UsersController.undo);

// admin
api.post("/admin/users/purchase", ...UsersController.purchase);

// transactions
api.post("/transactions", ...TransactionController.create);

export default api;
