import { Action } from './action.model';
import { Advertiser, MailingAddress, Sponsor, Subscriber } from './index';

export class EntryBase extends Action {
  id: string;
  paymentId: string;
  publicationId: string;
  publicationName: string;
  amount: number;
  createdAt: Date;
  dateAdded: Date;

  addDataToObj(input: any) {
    let pub,
      email,
      mailingAddress,
      className,
      entryRoleObj = {};

    if (input.publication) {
      pub = input.publication;
      delete input.publication;
      if (pub) {
        this.publicationId = pub.id;
        this.publicationName = pub.name;
      }
    }

    if (input.email) {
      email = input.email;
      delete input.email;
    }

    if (input.mailingAddress) {
      mailingAddress = input.mailingAddress;
    }

    if (input.createdAt) {
      input.createdAt = new Date(input.createdAt);
      input.dateAdded = new Date(input.createdAt);
    }

    if (input.sponsor) {
      entryRoleObj = input.sponsor;
      className = Sponsor;
    } else {
      if (input.subscriber) {
        entryRoleObj = input.subscriber;
        className = Subscriber;
      } else {
        if (input.advertiser) {
          entryRoleObj = input.advertiser;
          className = Advertiser;
        }
      }
    }
    if (email) {
      entryRoleObj['email'] = email;
    }
    if (mailingAddress) {
      entryRoleObj['mailingAddress'] = new MailingAddress().deserialize(
        mailingAddress
      );
    }
    const roleObj = new className().deserialize(entryRoleObj);
    return roleObj;
  }
}
