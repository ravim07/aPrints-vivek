import {
  Deserializable,
  SubscriptionSummaryItem,
  SubscriptionType,
} from '_models';

export class SubscriptionSummary implements Deserializable {
  totalAmount: number;
  subscribersCount: number;
  subscriptionsCount: number;
  perType: SubscriptionSummaryItem[];

  deserialize(input: any) {
    this.subscribersCount = 0;
    this.subscriptionsCount = 0;
    this.totalAmount = 0;
    this.perType = [];
    const emails = [];
    Object.keys(input).forEach((field) => {
      this.subscriptionsCount += input[field].subscriptionsCount;
      this.totalAmount += input[field].totalAmount;
      const item = new SubscriptionSummaryItem();
      item.subscriptionType = new SubscriptionType().deserialize(
        input[field].details
      );
      item.totalAmount = input[field].totalAmount;
      item.subscribersCount = input[field].subscriptionsCount;
      item.subscriptionsCount = input[field].subscribersCount;
      item.subscriptionType.subscribersCount = input[field].subscriptionsCount;
      item.subscriptionType.subscriptionsCount = input[field].subscribersCount;
      this.perType.push(item);

      input[field].items.forEach((donationItem) => {
        const sponsorEmail = donationItem.email.toLowerCase();
        if (emails.indexOf(sponsorEmail) < 0) {
          emails.push(sponsorEmail);
        }
      });

      this.subscribersCount += item.subscribersCount;
    });
    return this;
  }
}
