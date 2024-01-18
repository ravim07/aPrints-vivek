import { Deserializable } from './deserializable.model';
import { DraftFeedback } from './draft-feedback.model';
import { issueStatus } from './issue-status.model';

export class Draft implements Deserializable {
  id: string;
  dateAdded: Date;
  filePublicUrl: string;
  previewPdfUrl: string;
  fileId: string;
  thumbPublicUrl: string;
  uploaderId: string;
  uploaderType: string;
  publicationIssueId: string;
  draftFeedback: DraftFeedback[] = [];
  status: string;

  deserialize(input: any) {
    let draftFeedback;

    if (input._draftFeedback) {
      draftFeedback = input._draftFeedback;
      delete input._draftFeedback;
    }

    this.draftFeedback = new Array();
    if (draftFeedback) {
      draftFeedback.forEach(t => {
        this.draftFeedback.push(new DraftFeedback().deserialize(t));
      });
    }

    Object.assign(this, input);

    if (this.dateAdded) {
      this.dateAdded = new Date(this.dateAdded);
    }

    return this;
  }

  isPublished() {
    switch (this.status) {
      case issueStatus.draftSubmittedForPrintSchedule:
      case issueStatus.pricingInReview:
      case issueStatus.pricingConfirmed:
      case issueStatus.paymentSubmitted:
      case issueStatus.issueShipped:
      case issueStatus.issueDelivered:
        return true;
      default:
        return false;
    }
  }
}
