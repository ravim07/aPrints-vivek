import { Advertiser, Deserializable, MailingAddress } from '_models';
import { PageAdPricing } from './page-ad-pricing.model';
import { EntryBase } from './entry-base.model';
import { actionConfig } from './action-config.model';

export class PageAdPayment extends EntryBase implements Deserializable {
  adPricingId: string;
  pageAdPricingDetails: PageAdPricing;
  advertiser: Advertiser;

  deserialize(input: any) {
    this.addDataToObj(input);
    Object.assign(this, input);
    if (this.pageAdPricingDetails) {
      console.log(this.pageAdPricingDetails);
      this.pageAdPricingDetails = new PageAdPricing().deserialize(this.pageAdPricingDetails);
      console.log(this.pageAdPricingDetails);
    }
    return this;
  }

  completeActionConfig () {
    Object.assign(this, actionConfig.getConfig('newAdPayment', {publicationId: this.publicationId},
    {
      fullName: this.advertiser.name,
      email: this.advertiser.email
    },
    {
      linkText: this.pageAdPricingDetails.typeLiteral + ' - $' + this.pageAdPricingDetails.amount,
      redirectUrl: `/dashboard/publication/${this.publicationId}/advertising/report`
    }));
  }

}
