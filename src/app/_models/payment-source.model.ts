import { Deserializable } from '_models';

export class PaymentSource implements Deserializable {
  id: string;
  bankName: string;
  last4: string;
  sourceId: string;
  status: string;
  createdAt: Date;

  deserialize(input: any) {

    Object.assign(this, input);

    if (this.createdAt) {
      this.createdAt = new Date(this.createdAt);
    }

    return this;
  }
}