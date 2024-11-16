export interface Price {
  id: string;
  price: number;
}

export interface Interval {
  endDateTime: string;
  startDateTime: string;
}

export default class Product {
  active: boolean;
  adminSchedule?: Interval[];
  created: string;
  description_en: string;
  description_es: string;
  discountPlan: number;
  duration: number;
  image: string;
  name_en: string;
  name_es: string;
  price: number;
  prices: Price[];
  schedule: Interval[];
  slug: string;
  updated: string;

  constructor(
    active: boolean,
    created: string,
    description_en: string,
    description_es: string,
    discountPlan: number,
    duration: number,
    image: string,
    name_en: string,
    name_es: string,
    price: number,
    prices: Price[],
    schedule: Interval[],
    slug: string,
    updated: string,
    adminSchedule?: Interval[]
  ) {
    this.active = active;
    this.adminSchedule = adminSchedule;
    this.created = created;
    this.description_en = description_en;
    this.description_es = description_es;
    this.discountPlan = discountPlan;
    this.duration = duration;
    this.image = image;
    this.name_en = name_en;
    this.name_es = name_es;
    this.price = price;
    this.prices = prices;
    this.schedule = schedule;
    this.slug = slug;
    this.updated = updated;
  }
}
