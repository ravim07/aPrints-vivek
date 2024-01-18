import {
  CustomerAccount,
  Deserializable,
  DiscussionEntry,
  IssueStatusTracking,
  MailingAddress,
  PageAdPricing,
  PrintingPreferences,
} from '_models';
import { Action } from './action.model';
import { AvailableFunds } from './available-funds.model';
import { DonationLevel } from './donation-level.model';
import { Donation } from './donation.model';
import { getFormattedDate, Issue } from './issue.model';
import { PageAdPayment } from './page-ad-payment.model';
import { SubscriptionType } from './subscription-type.model';
import { Subscription } from './subscription.model';
import { Transfer } from './transfer.model';

export class Publication implements Deserializable {
  id: string;
  dateCreated: Date;
  imgPath: string;
  tags: string[];
  name: string;
  schedule: Array<Date>;
  printingPreferences: PrintingPreferences;
  mailingAddress: MailingAddress;
  defaultPaymentMethod: string;
  publicationIssues: Array<Issue>;
  role: string;
  description: string;
  organization: string;
  customerAccounts: Array<CustomerAccount>;
  transfers: Array<Transfer>;
  availableFunds: AvailableFunds;
  pageAdsPricingMatrix: Array<PageAdPricing>;
  pageAdPayments: Array<PageAdPayment>;
  donations: Array<Donation>;
  subscriptions: Array<Subscription>;
  discussionEntries: Array<DiscussionEntry>;
  actions: Array<Action>;
  stripeAccount: any;
  timeline: Array<| DiscussionEntry
    | Action
    | IssueStatusTracking
    | Donation
    | Subscription
    | PageAdPayment>;
  cover: string;
  covers: Array<string> = [];
  members: Array<string> = [];
  communityInfo: {
    title: string;
    description: string;
  } = { title: '', description: '' };
  hasInvoices: boolean;

  deserialize(input: any) {
    let pubIssues,
      customerAccounts,
      transfers,
      availableFunds,
      pageAdsPricingMatrix,
      pageAdPayments,
      actions,
      donations,
      subscriptions,
      communityInfo,
      statusTrackingArr: Array<IssueStatusTracking> = [];

    delete input.contributorIds;
    delete input.managingEditorIds;
    delete input.editorialStaffIds;
    delete input.subscriberIds;
    delete input.advertiserIds;
    delete input.sponsorIds;
    delete input._pageAdsConfig;
    delete input._discounts;

    this.id = input._id;

    if (input._publicationIssues) {
      pubIssues = input._publicationIssues;
      delete input._publicationIssues;
    }

    if (input._customerAccount) {
      customerAccounts = input._customerAccount;
      delete input._customerAccount;
    }

    if (input._transfers) {
      transfers = input._transfers;
      delete input._transfers;
    }

    if (input._donations) {
      donations = input._donations;
      delete input._donations;
    }

    if (input._subscriptions) {
      subscriptions = input._subscriptions;
      delete input._subscriptions;
    }

    if (input._pageAdsPricingMatrix) {
      pageAdsPricingMatrix = input._pageAdsPricingMatrix;
      delete input._pageAdsPricingMatrix;
    }

    if (input._pageAdPayments) {
      pageAdPayments = input._pageAdPayments;
      delete input._pageAdPayments;
    }

    if (input.availableFunds) {
      availableFunds = input.availableFunds;
      delete input.availableFunds;
    }

    const scheduleDates = [];
    if (input.schedule && input.schedule.length > 0) {
      input.schedule.forEach((d) =>
        scheduleDates.push(new Date(input.schedule[d.when]))
      );
    }

    let discussionEntries;
    if (input._discussionEntries) {
      discussionEntries = input._discussionEntries;
      delete input._discussionEntries;
    }

    if (input._actions) {
      actions = input._actions;
      delete input._actions;
    }

    if (input.communityInfo) {
      communityInfo = input.communityInfo;
      delete input.communityInfo;
    }

    this.stripeAccount = input._stripeAccount;
    Object.assign(this, input);
    this.communityInfo = communityInfo || { title: '', description: '' };

    this.printingPreferences = new PrintingPreferences().deserialize(
      input.printingPreferences
    );
    this.mailingAddress = new MailingAddress().deserialize(
      input.mailingAddress
    );

    if (this.dateCreated) {
      this.dateCreated = new Date(this.dateCreated);
    }

    this.customerAccounts = new Array();
    if (customerAccounts) {
      customerAccounts.forEach((cA) => {
        this.customerAccounts.push(new CustomerAccount().deserialize(cA));
      });
    }

    this.transfers = new Array();
    if (transfers) {
      transfers.forEach((t) => {
        this.transfers.push(new Transfer().deserialize(t));
      });
    }

    this.pageAdsPricingMatrix = new Array();
    if (pageAdsPricingMatrix) {
      pageAdsPricingMatrix.forEach((t) => {
        this.pageAdsPricingMatrix.push(new PageAdPricing().deserialize(t));
      });
    }

    this.discussionEntries = new Array();
    if (discussionEntries) {
      discussionEntries.forEach((de) => {
        const entry = new DiscussionEntry().deserialize(de);
        if (entry.issueId) {
          const issue = pubIssues.filter((o) => o.id === entry.issueId)[0];
          const dDate = new Date(issue.deliveryDate);
          entry.issueName = getFormattedDate(dDate);
        }
        this.discussionEntries.push(entry);
      });
      this.discussionEntries.reverse();
    }

    this.publicationIssues = new Array();
    if (pubIssues) {
      pubIssues.forEach((issue) => {
        issue.discussionEntries = this.discussionEntries.filter(
          (o) => o.issueId === issue.id
        );
        const deserializedIssue = new Issue().deserialize(issue);
        const draft = deserializedIssue.getCurrentDraft();
        if (draft && draft.thumbPublicUrl && draft.thumbPublicUrl !== '') {
          this.cover = draft.thumbPublicUrl;
          this.covers.push(draft.thumbPublicUrl);
        }
        const statusArr = [...deserializedIssue.publicationIssueStatusTracking]; // console.log(statusArr);
        if (statusArr[0]) {
          while (true) {
            // console.log(statusArr[0]);
            if (statusArr[0] && statusArr[0].statusTo === 'issueCreated') {
              const seconds =
                (statusArr[0].date.getTime() - this.dateCreated.getTime()) /
                1000;
              if (seconds < 2) {
                // Aprox max time to create a batch issue when creating a publication
                statusArr.shift();
              } else {
                break;
              }
            } else {
              break;
            }
          }
          statusTrackingArr = [...statusTrackingArr, ...statusArr];
        }
        this.publicationIssues.push(deserializedIssue);
      });
      this.covers.reverse();
      this.publicationIssues.sort((a, b) => {
        if (a.deliveryDate && b.deliveryDate) {
          return a.deliveryDate.valueOf() - b.deliveryDate.valueOf();
        } else if (a.deliveryDate) {
          return -1;
        } else {
          return 1;
        }
      });
    }

    this.pageAdPayments = new Array();
    if (pageAdPayments) {
      pageAdPayments.forEach((t) => {
        const pageAdPayment = new PageAdPayment().deserialize(t);
        const config = this.pageAdsPricingMatrix.filter(
          (o) => o.id === pageAdPayment.adPricingId
        )[0];
        pageAdPayment.pageAdPricingDetails = new PageAdPricing().deserialize(
          config
        );
        pageAdPayment.completeActionConfig();
        this.pageAdPayments.push(pageAdPayment);
      });
    }

    this.donations = new Array();
    if (donations) {
      const donationLevels = input._donationLevels;
      delete input._donationLevels;
      donations.forEach((d) => {
        const donation = new Donation().deserialize(d);
        const config = donationLevels.filter(
          (o) => o.id === donation.donationLevel
        )[0];
        donation.donationLevelDetails = new DonationLevel().deserialize(config);
        donation.completeActionConfig();
        this.donations.push(donation);
      });
    }

    this.subscriptions = new Array();
    if (subscriptions) {
      const subscriptionTypes = input._subscriptionTypes;
      delete input._subscriptionTypes;
      subscriptions.forEach((s) => {
        const subscription = new Subscription().deserialize(s);
        const config = subscriptionTypes.filter(
          (o) => o.id === subscription.subscriptionType
        )[0];
        subscription.subscriptionTypeDetails = new SubscriptionType().deserialize(
          config
        );
        subscription.completeActionConfig();
        this.subscriptions.push(subscription);
      });
    }

    this.actions = new Array();
    if (actions) {
      actions.forEach(async (a) => {
        const action = new Action().deserialize(a);
        const issue = this.publicationIssues.find(
          (e) => e.id === action.originData.issueId
        );
        if (issue) {
          action.originData.issueName = issue.name;
        }
        this.actions.push(action);
      });
      this.actions.reverse();
    }

    this.availableFunds = new AvailableFunds().deserialize(availableFunds);
    // console.log('statusTrackingArr', statusTrackingArr);
    this.timeline = [
      ...this.discussionEntries,
      ...this.actions,
      ...statusTrackingArr,
      ...this.donations,
      ...this.subscriptions,
      ...this.pageAdPayments,
    ].sort((a, b) => b.dateAdded.valueOf() - a.dateAdded.valueOf());
    // console.log(this.timeline);
    return this;
  }

  findIssue(issueId: string): Promise<Issue> {
    return new Promise(async (resolve, reject) => {
      try {
        for (let i = 0; i < this.publicationIssues.length; i++) {
          if (this.publicationIssues[i].id === issueId) {
            resolve(this.publicationIssues[i]);
          }
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  sortByDate(a, b, dateProperty: string) {
    return a[dateProperty] - b[dateProperty];
  }
}
