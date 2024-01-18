import {
  Deserializable,
  DiscussionEntry,
  Draft,
  IssueStatusTracking,
  MailingAddress,
  PaymentMethod,
  Pricing,
  PrintingPreferences,
} from '_models';
import { AdResource } from './ad-resource.model';
import { Contribution } from './contribution.model';
import { Invoice } from './invoice.model';
import { issueStatus } from './issue-status.model';
import { Payment } from './payment.model';

export class Issue implements Deserializable {
  id: string;
  name: string;
  deliveryDate: Date;
  status: string;
  publicationId: string;
  publicationName: string;
  organizationName: string;
  updatedAt: Date;
  createdAt: Date;
  number: string;
  printingPreferences: PrintingPreferences;
  mailingAddress: MailingAddress;
  publicationIssueStatusTracking: Array<IssueStatusTracking>;
  publicationIssueDrafts: Array<Draft>;
  trackingUrl: string;
  _contributions: Contribution[];
  _advertisements: AdResource[];
  _adResources: AdResource[];
  pricingRequest: Pricing;
  paymentMethod: PaymentMethod = new PaymentMethod();
  payment: Payment = new Payment();
  lastStatus: IssueStatusTracking;
  discussionEntries?: Array<DiscussionEntry>;
  advertisements: Array<AdResource>;
  contributions: Array<Contribution>;
  invoice: Invoice;
  coverImage: {
    fileId: string;
    fileUrl: string;
    previewPdfUrl: string;
    publicId: string;
    publicUrl: string;
  };

  // List short props
  cover: string;
  totalSubmissions: number;
  totalAdvertisements: number;
  menuStatus: string;
  addressIds: string[];
  deserialize(input: any) {
    // console.log(input);
    let evts;
    if (input._publicationIssueStatusTracking) {
      evts = input._publicationIssueStatusTracking;
      delete input._publicationIssueStatusTracking;
    }

    let publicationIssueDrafts;
    if (input._publicationIssueDrafts) {
      publicationIssueDrafts = input._publicationIssueDrafts;
      delete input._publicationIssueDrafts;
    }

    let contributions;
    if (input._contributions) {
      contributions = input._contributions;
      delete input._contributions;
    }

    let advertisements;
    if (input._advertisements) {
      advertisements = input._advertisements;
      delete input._advertisements;
    }

    if (input._pricingRequest) {
      this.pricingRequest = new Pricing().deserialize(input._pricingRequest);
      delete input._pricingRequest;
    }

    if (input._paymentMethod) {
      this.paymentMethod = new PaymentMethod().deserialize(
        input._paymentMethod
      );
      delete input._paymentMethod;
    }

    if (input._payment) {
      this.payment = new Payment().deserialize(input._payment);
      delete input._payment;
    }

    if (input._invoice) {
      this.invoice = new Invoice().deserialize(input._invoice, input);
      delete input._invoice;
    }

    let publication;
    if (input.publication) {
      publication = input.publication;
      delete input.publication;
    }

    Object.assign(this, input);

    this.menuStatus = issueStatus.showStatus(this.status);

    if (publication) {
      this.publicationId = publication.id;
      this.publicationName = publication.name;
      this.organizationName = publication.organization;
    }

    if (this.deliveryDate) {
      this.deliveryDate = new Date(this.deliveryDate);
    }

    if (input.updatedAt) {
      this.updatedAt = new Date(input.updatedAt);
    }

    if (!this.name && this.deliveryDate) {
      this.name = getFormattedDate(this.deliveryDate);
    }

    this.printingPreferences = new PrintingPreferences().deserialize(
      input.printingPreferences
    );
    this.mailingAddress = new MailingAddress().deserialize(
      input.mailingAddress
    );

    this.publicationIssueStatusTracking = new Array();
    if (evts) {
      evts.forEach((evt) => {
        evt.publicationName = this.publicationName;
        evt.publicationId = this.publicationId;
        evt.issueName = this.name;
        this.publicationIssueStatusTracking.push(
          new IssueStatusTracking().deserialize(evt)
        );
      });
      if (evts.length) {
        this.lastStatus = new IssueStatusTracking().deserialize(
          evts[evts.length - 1]
        );
      } else {
        const obj = new IssueStatusTracking();
        obj.date = new Date(this.createdAt);
        obj.statusTo = this.status;
        this.lastStatus = obj;
      }
      this.publicationIssueStatusTracking.reverse();
    }

    this.publicationIssueDrafts = new Array();
    if (publicationIssueDrafts) {
      publicationIssueDrafts.forEach((draft) => {
        draft.issueName = this.name;
        this.publicationIssueDrafts.push(new Draft().deserialize(draft));
      });
    }

    this.cover = this.coverImage ? this.coverImage.publicUrl : '';

    this.contributions = new Array();
    if (contributions) {
      contributions.forEach((contribution) => {
        contribution.issueName = this.name;
        this.contributions.push(new Contribution().deserialize(contribution));
      });
      this.contributions.reverse();
      this.totalSubmissions = contributions.length;
    }
    this.advertisements = [];
    if (advertisements) {
      advertisements.forEach((advertisement) => {
        advertisement.issueName = this.name;
        this.advertisements.push(new AdResource().deserialize(advertisement));
      });
      this.advertisements.reverse();
      this.totalAdvertisements = advertisements.length;
    }

    return this;
  }

  getCurrentDraft() {
    const length = this.publicationIssueDrafts.length;
    if (length > 0) {
      return this.publicationIssueDrafts[length - 1];
    }
  }

  canContribute() {
    switch (this.status) {
      // case issueStatus.draftUploaded:
      // case issueStatus.draftSubmittedForReview:
      // case issueStatus.draftInReview:
      // case issueStatus.reviewCanceled:
      // case issueStatus.draftAccepted:
      // case issueStatus.draftRejected:
      // case issueStatus.draftSubmittedForPrintSchedule:
      // case issueStatus.pricingInReview:
      // case issueStatus.pricingConfirmed:
      // case issueStatus.paymentSubmitted:
      // case issueStatus.issueShipped:
      // case issueStatus.issueDelivered:
      //   return false;
      default:
        return true;
    }
  }

  canAdvertise() {
    switch (this.status) {
      // case issueStatus.draftUploaded:
      // case issueStatus.draftSubmittedForReview:
      // case issueStatus.draftInReview:
      // case issueStatus.reviewCanceled:
      // case issueStatus.draftAccepted:
      // case issueStatus.draftRejected:
      // case issueStatus.draftSubmittedForPrintSchedule:
      // case issueStatus.pricingInReview:
      // case issueStatus.pricingConfirmed:
      // case issueStatus.paymentSubmitted:
      // case issueStatus.issueShipped:
      // case issueStatus.issueDelivered:
      //   return false;
      default:
        return true;
    }
  }

  get completed() {
    return ![
      issueStatus.issueCreated,
      issueStatus.reviewCanceled,
      issueStatus.draftUploaded,
      issueStatus.draftSubmittedForReview,
      issueStatus.draftInReview,
      issueStatus.draftRejected,
    ].includes(this.status);
  }

}

export function getFormattedDate(date) {
  const year = date.getFullYear();

  let month = (1 + date.getMonth()).toString();
  month = month.length > 1 ? month : '0' + month;

  let day = date.getDate().toString();
  day = day.length > 1 ? day : '0' + day;

  return month + '/' + day + '/' + year;
}
