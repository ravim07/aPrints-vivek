import { Deserializable, PaymentMetadata } from './';

export class Payment implements Deserializable {
  id: string = null;
  publicationId: string;
  publicationName: string;
  issueId: string;
  issueNumber: number;
  draftId: string;
  email: string = null;
  type: string = null;
  price = 0;
  shipping = 0;
  tax = 0;
  totalAmount = 0;
  transactionRate = 0;
  date: string;
  paymentMetadata: PaymentMetadata = new PaymentMetadata();

  deserialize(input: any) {
    Object.assign(this, input);
    return this;
  }
}
