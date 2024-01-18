import { Deserializable } from './deserializable.model';
import { round } from 'utils';

export class Pricing implements Deserializable {
  id: string;
  zipCode: number;
  insidePages: number;
  numberOfCopies: number;
  color: boolean;
  price = 0;
  shipping = 0;
  tax = 0;
  discount = 0;
  chargeAmount = 0;
  flatAmount = 0;
  chargeFee = 0;
  status: string;
  date: string;

  deserialize(input: any) {
    Object.assign(this, input);
    this.chargeFee = round(this.chargeFee, 2);
    this.chargeAmount = round(this.chargeAmount, 2);
    return this;
  }
}
