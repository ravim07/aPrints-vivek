import { Deserializable } from './deserializable.model';
import { SubscriptionType } from './subscription-type.model';

export class SubscriptionSummaryItem implements Deserializable {
  subscriptionType: SubscriptionType;
  totalAmount: number;
  subscribersCount: number;
  subscriptionsCount: number;

  deserialize(input: any) {
    Object.assign(this, input);
    return this;
  }
}
