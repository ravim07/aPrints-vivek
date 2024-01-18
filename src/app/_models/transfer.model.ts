import { Deserializable } from "./deserializable.model";

export class Transfer implements Deserializable {
  id: string;
  description: string;
  actor: {
    id: string,
    name: string,
    type: string,
    customerId: string,
    sourceId: string,
  };
  stripeDetails: {
    customerId: string,
    sourceId: string,
  };
  bankAccountInfo: {
    bankName: string,
    last4: string,
  };
  paymentId: string;
  publicationId: string;
  transferType: string;
  createdAt: Date;
  amount: number;
  chargeAmount: number;
  chargeFee: number;

  deserialize(input: any){
    Object.assign(this, input);
    return this;
  }
}
