import { Deserializable } from './deserializable.model';
import { PageAdPricing } from './page-ad-pricing.model';

export class AdvertisingSummaryItem implements Deserializable {
  adPricing: PageAdPricing;
  totalAmount: number;
  advertisersCount: number;
  pageAdPaymentsCount: number;

  deserialize(input: any) {
    Object.assign(this, input);
    return this;
  }
}
