import * as admin from "firebase-admin";

export default class Transaction {
  static collection() {
    return admin.database().ref("transactionss/");
  }

  static ref(id: string) {
    return admin.database().ref(`transactionss/${id}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async create(transaction: any) {
    const ref = Transaction.collection().push();
    await ref.set(transaction);
  }
}
