import * as admin from "firebase-admin";

import {Price} from "../models/Product";

export default class Plan {
  active: boolean;
  color: string;
  created: string;
  description_en: string;
  description_es: string;
  durationDays: number;
  image: string;
  index: number;
  maxUsers: number;
  maxVehicles: number;
  name_en: string;
  name_es: string;
  price: number;
  prices?: Price[];
  purchaseDateEnd: string;
  purchaseDateStart: string;
  servicesNumber: number;
  slug: string;
  updated: string;

  constructor(
    active: boolean,
    color: string,
    created: string,
    description_en: string,
    description_es: string,
    durationDays: number,
    image: string,
    index: number,
    maxUsers: number,
    maxVehicles: number,
    name_en: string,
    name_es: string,
    price: number,
    prices: Price[],
    purchaseDateEnd: string,
    purchaseDateStart: string,
    servicesNumber: number,
    slug: string,
    updated: string
  ) {
    this.active = active;
    this.color = color;
    this.created = created;
    this.description_en = description_en;
    this.description_es = description_es;
    this.durationDays = durationDays;
    this.image = image;
    this.index = index;
    this.maxUsers = maxUsers;
    this.maxVehicles = maxVehicles;
    this.name_en = name_en;
    this.name_es = name_es;
    this.price = price;
    this.prices = prices;
    this.purchaseDateEnd = purchaseDateEnd;
    this.purchaseDateStart = purchaseDateStart;
    this.servicesNumber = servicesNumber;
    this.slug = slug;
    this.updated = updated;
  }

  static collection() {
    return admin.database().ref("plans/");
  }

  static ref(uid: string) {
    return admin.database().ref(`plans/${uid}`);
  }

  static async show(id: string) {
    const snap = await Plan.ref(id).get();
    return snap.val();
  }
}
