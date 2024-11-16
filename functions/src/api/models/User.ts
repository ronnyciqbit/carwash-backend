import * as admin from "firebase-admin";

import moment from "moment";

import GiftCard from "./clover/GiftCard";
import Customer from "./clover/Customer";
import env from "../../env.production";
import Purchase from "./Purchase";

export default class User {
  active: boolean;
  birthDate?: string;
  city?: string;
  email: string;
  emailVerified?: boolean;
  firstName?: string;
  gender?: string;
  lastName?: string;
  notificationId?: string;
  phone?: string;
  profileFilled?: boolean;
  purchaseActive?: string;
  qrCode: string;
  role: string;
  uid: string;
  zipCode?: string;
  customerId?: string;
  code: string;
  created: Date;

  constructor(props: User) {
    this.active = props.active;
    this.birthDate = props.birthDate;
    this.city = props.city;
    this.email = props.email;
    this.emailVerified = props.emailVerified;
    this.firstName = props.firstName;
    this.gender = props.gender;
    this.lastName = props.lastName;
    this.notificationId = props.notificationId;
    this.phone = props.phone;
    this.profileFilled = props.profileFilled;
    this.purchaseActive = props.purchaseActive;
    this.qrCode = props.qrCode;
    this.role = props.role;
    this.uid = props.uid;
    this.zipCode = props.zipCode;
    this.created = props.created;
    this.customerId = props.customerId;
    this.code = props.code;
  }

  static collection() {
    return admin.database().ref("users/");
  }

  static ref(uid: string) {
    return admin.database().ref(`users/${uid}`);
  }

  static async update(uid: string, fields: Partial<User>): Promise<void> {
    const ref = User.ref(uid);
    await ref.update(fields);
  }

  static async find(attribute: string, value: string) {
    const snapshot = await User.collection()
      .orderByChild(attribute)
      .equalTo(value)
      .once("value");

    if (snapshot.exists()) {
      const val = snapshot.val();
      const uid = Object.keys(val)[0];
      const props = val[uid];

      return new User({...props, uid});
    } else {
      throw new Error("not found");
    }
  }

  static async reward(user: User) {
    const email = user.email;
    const uid = user.uid;

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
  }
}
