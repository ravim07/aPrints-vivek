import { Deserializable } from './deserializable.model';
import { DonationLevel } from './donation-level.model';

export class DonationSummaryItem implements Deserializable {
  donationLevel: DonationLevel;
  totalAmount: number;
  sponsorsCount: number;
  donationsCount: number;

  deserialize(input: any) {
    Object.assign(this, input);
    return this;
  }
}
