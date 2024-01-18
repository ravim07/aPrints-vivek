import { Deserializable, DonationLevel, MailingAddress, Sponsor } from '_models';
import { EntryBase } from './entry-base.model';
import { OriginData, UserData } from './action.model';
import { actionConfig } from './action-config.model';

export class Donation extends EntryBase implements Deserializable {
  donationLevel: string;
  donationLevelDetails: DonationLevel;
  sponsor: Sponsor;

  deserialize(input: any) {
    this.addDataToObj(input);
    Object.assign(this, input);
    return this;
  }

  completeActionConfig() {
    let name = this.donationLevelDetails.name, amount = this.donationLevelDetails.amount;
    if (this.donationLevel === 'customAmount') {
      name = 'Custom Amount'; amount = this.amount;
    }
    Object.assign(this, actionConfig.getConfig('newDonation', {publicationId: this.publicationId},
    {
      fullName: this.sponsor.name,
      email: this.sponsor.email
    },
    {
      linkText: name + ' - $' + amount,
      redirectUrl: `/dashboard/publication/${this.publicationId}/fundraising/report`,
    }));
  }

}
