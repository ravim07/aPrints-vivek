import { AdvertisingSummaryItem, Deserializable, PageAdPricing } from '_models';
import { Publication } from './publication.model';

export interface AdvertisingSummaryEntryData {
  publication: Publication;
  advertisingSummary: AdvertisingSummary;
}

export interface AdvertisingSummaryPerTypeItem {
  typeLiteral: string;
  description: string;
  items: AdvertisingSummaryItem[];
  numberOfIssues: number;
  subtotal: number;
}

export interface AdvertisingSummaryPerType {
  [key: string]: AdvertisingSummaryPerTypeItem;
}

export class AdvertisingSummary implements Deserializable {
  totalAmount = 0;
  advertisersCount = 0;
  pageAdPaymentsCount = 0;
  perGroup: AdvertisingSummaryItem[] = [];
  groupPerId: AdvertisingSummaryItem[] = [];
  perType: AdvertisingSummaryPerType = {};
  perTypeSet: Set<AdvertisingSummaryPerTypeItem> = new Set();
  perTypeArr: Array<AdvertisingSummaryPerTypeItem> = [];
  displayedColumns: string[] = ['typeLiteral', 'description'];
  rowHelper: number[] = [];

  deserialize(input: any) {
    const emails = [];
    Object.keys(input).forEach((field) => {
      this.pageAdPaymentsCount += input[field].pageAdPaymentsCount;
      this.totalAmount += input[field].totalAmount;
      const item = this.createSummaryItem(input[field]);
      this.groupPerId[field] = item;
      this.perGroup.push(item);
      this.populatePerType(item);
      input[field].items.forEach((adItem) => {
        const advertiserEmail = adItem.email.toLowerCase();
        if (emails.indexOf(advertiserEmail) < 0) {
          emails.push(advertiserEmail);
        }
      });

      this.advertisersCount += item.advertisersCount;
    });
    console.log(this.perTypeSet);
    if (Array.from(this.perTypeSet.entries()).length > 0) {
      this.perTypeArr = Array.from(this.perTypeSet);
      for (let i = 1; i <= this.perTypeArr[0].numberOfIssues; i++) {
        this.displayedColumns.push(i.toString());
        this.rowHelper.push(i);
      }
    }
    this.displayedColumns.push('subtotal');

    return this;
  }

  createSummaryItem(itemData: any): AdvertisingSummaryItem {
    const item = new AdvertisingSummaryItem();
    item.adPricing = new PageAdPricing().deserialize(itemData.details);
    item.totalAmount = itemData.totalAmount;
    item.pageAdPaymentsCount = itemData.pageAdPaymentsCount;
    item.advertisersCount = itemData.advertisersCount;
    return item;
  }

  populatePerType(item: AdvertisingSummaryItem) {
    if (item.adPricing) {
      if (
        !Object.prototype.hasOwnProperty.call(this.perType, item.adPricing.type)
      ) {
        this.perType[item.adPricing.type] = {
          typeLiteral: item.adPricing.typeLiteral,
          description: item.adPricing.description,
          items: [],
          numberOfIssues: 0,
          subtotal: 0,
        };
      }
      this.perType[item.adPricing.type].items.push(item);
      this.perType[item.adPricing.type].numberOfIssues =
        this.perType[item.adPricing.type].numberOfIssues >
        item.adPricing.numberOfIssues
          ? this.perType[item.adPricing.type].numberOfIssues
          : item.adPricing.numberOfIssues;
      this.perType[item.adPricing.type][item.adPricing.numberOfIssues] =
        item.adPricing.amount;
      this.perType[item.adPricing.type][
        item.adPricing.numberOfIssues + 'count'
      ] = item.pageAdPaymentsCount ? item.pageAdPaymentsCount : '-';
      this.perType[item.adPricing.type].subtotal += item.totalAmount;
      this.perTypeSet.add(this.perType[item.adPricing.type]);
    }
  }
}
