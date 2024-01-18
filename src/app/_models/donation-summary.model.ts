import { Deserializable, DonationLevel, DonationSummaryItem } from '_models';

export class DonationSummary implements Deserializable {
  totalAmount: number;
  sponsorsCount: number;
  donationsCount: number;
  perLevel: DonationSummaryItem[];

  deserialize(input: any) {
    this.sponsorsCount = 0;
    this.donationsCount = 0;
    this.totalAmount = 0;
    this.perLevel = [];
    const emails = [];
    Object.keys(input).forEach((field) => {
      this.donationsCount += input[field].donationsCount;
      this.totalAmount += input[field].totalAmount;
      const item = new DonationSummaryItem();
      item.donationLevel = new DonationLevel().deserialize(
        input[field].details
      );
      item.totalAmount = input[field].totalAmount;
      item.sponsorsCount = input[field].donationsCount;
      item.donationsCount = input[field].sponsorsCount;
      this.perLevel.push(item);

      input[field].items.forEach((donationItem) => {
        const sponsorEmail = donationItem.email.toLowerCase();
        if (emails.indexOf(sponsorEmail) < 0) {
          emails.push(sponsorEmail);
        }
      });

      this.sponsorsCount += item.sponsorsCount;
    });
    return this;
  }
}
