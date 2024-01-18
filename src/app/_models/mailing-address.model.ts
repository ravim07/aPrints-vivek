import { Deserializable } from './deserializable.model';

export class MailingAddress implements Deserializable {
  organization: string;
  addressedTo: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: number;
  phone: string;
  shipTo: string;

  deserialize(input: any) {
    Object.assign(this, input);
    if (this.zip === 0) {
      this.zip = null;
    }
    return this;
  }
}
