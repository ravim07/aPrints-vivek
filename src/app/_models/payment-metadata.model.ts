import { Deserializable } from './deserializable.model';
type accountType = 'Individual' | 'Company';

export class PaymentMetadata implements Deserializable {
  name: string = null;
  lastName: string = null;
  address1 = '';
  address2 = '';
  city: string = null;
  state: string = null;
  zip: string = null;
  phone: string = null;
  accountNumber: string = null;
  routingNumber: string = null;
  accountHolderType?: accountType = 'Individual';
  otherDetail: string = null;
  method?: string;
  brand: string;
  lastFour: string;

  deserialize(input: any) {
    Object.assign(this, input);
    return this;
  }
}
