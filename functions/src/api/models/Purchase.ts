import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import User from "./User";

export default class Purchase {
  comments: string;
  giftCardCode: string;
  endDate: string;
  plan: string;
  price: number;
  remainingNumber: number;
  selectedPaymentType: string;
  slug: string;
  startDate: string;
  users: string[];
  vehicleType: string;

  constructor(props: Purchase) {
    this.comments = props.comments;
    this.giftCardCode = props.giftCardCode;
    this.endDate = props.endDate;
    this.plan = props.plan;
    this.price = props.price;
    this.remainingNumber = props.remainingNumber;
    this.selectedPaymentType = props.selectedPaymentType;
    this.slug = props.slug;
    this.startDate = props.startDate;
    this.users = props.users;
    this.vehicleType = props.vehicleType;
  }

  static collection() {
    return admin.database().ref("planPurchases/");
  }

  static ref(slug: string) {
    return admin.database().ref(`planPurchases/${slug}`);
  }

  static async create(uid: string, purchase: Purchase) {
    try {
      const ref = Purchase.collection().push();
      await ref.set(purchase);

      await User.ref(uid).update({purchaseActive: ref.key});
    } catch (error) {
      logger.error("'Purchase.create' failed", logger);
      throw error;
    }
  }

  static async get(id?: string) {
    const snapshot = await Purchase.ref(id || "none").get();

    return snapshot.exists() ? snapshot.val() : null;
  }
}
