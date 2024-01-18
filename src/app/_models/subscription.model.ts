import { Deserializable, MailingAddress, SubscriptionType, Subscriber } from '_models';
import { EntryBase } from './entry-base.model';
import { actionConfig } from './action-config.model';

export class Subscription extends EntryBase implements Deserializable {
  subscriptionType: string;
  subscriptionTypeDetails: SubscriptionType;
  subscriber: Subscriber;

  deserialize(input: any) {
    this.addDataToObj(input);
    Object.assign(this, input);
    return this;
  }

  completeActionConfig() {
    let name = this.subscriptionTypeDetails.name, amount = this.subscriptionTypeDetails.amount;
    if (this.subscriptionType === 'selfManaged') {
      name = 'Self Managed'; amount = this.amount;
    } else {
      Object.assign(this, actionConfig.getConfig('newSubscription', {publicationId: this.publicationId},
      {
        fullName: this.subscriber.name,
        email: this.subscriber.email
      },
      {
        linkText: name + ' - $' + amount,
        redirectUrl: `/dashboard/publication/${this.publicationId}/fundraising/subscription-report`
      }));
    }
  }

}
