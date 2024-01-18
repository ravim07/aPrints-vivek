export const issueStatus = {
  issueCreated: 'issueCreated',
  printingDataConfirmed: 'printingDataConfirmed',
  draftUploaded: 'draftUploaded',
  draftSubmittedForReview: 'draftSubmittedForReview',
  draftInReview: 'draftInReview',
  draftAccepted: 'draftAccepted',
  draftRejected: 'draftRejected',
  draftSubmittedForPrintSchedule: 'draftSubmittedForPrintSchedule',
  pricingInReview: 'pricingInReview',
  pricingConfirmed: 'pricingConfirmed',
  paymentSubmitted: 'paymentSubmitted',
  issueShipped: 'issueShipped',
  issueDelivered: 'issueDelivered',
  reviewCanceled: 'reviewCanceled',
  getStatusStrAdmin: function (status) {
    switch (status) {
      case issueStatus.issueCreated:
        return 'Issue Created';
      case issueStatus.printingDataConfirmed:
        return 'Printing Data Confirmed';
      case issueStatus.draftUploaded:
        return 'Draft Uploaded';
      case issueStatus.draftSubmittedForReview:
        return 'Draft Submitted for Review';
      case issueStatus.draftInReview:
        return 'Draft in Review';
      case issueStatus.reviewCanceled:
        return 'Review Canceled';
      case issueStatus.draftAccepted:
        return 'Draft Accepted';
      case issueStatus.draftRejected:
        return 'Draft Requires Modification';
      case issueStatus.draftSubmittedForPrintSchedule:
        return 'Submitted For Print';
      case issueStatus.pricingInReview:
        return 'Pricing in Review';
      case issueStatus.pricingConfirmed:
        return 'Pricing Confirmed';
      case issueStatus.paymentSubmitted:
        return 'Payment Submitted';
      case issueStatus.issueShipped:
        return 'Issue Shipped';
      case issueStatus.issueDelivered:
        return 'Issue Delivered';
    }
  },
  showStatus(status) {
    switch (status) {
      case issueStatus.issueCreated:
        return 'Created';
      case issueStatus.printingDataConfirmed:
        return 'Print Prefs Confirmed';
      case issueStatus.draftUploaded:
        return 'PDF uploaded';
      case issueStatus.draftSubmittedForReview:
        return 'PDF Submitted for Review';
      case issueStatus.draftInReview:
        return 'In Review';
      case issueStatus.draftAccepted:
        return 'Review approved';
      case issueStatus.draftRejected:
        return 'Requires Modification';
      case issueStatus.draftSubmittedForPrintSchedule:
        return 'Printing';
      case issueStatus.pricingInReview:
        return 'Pricing In Review';
      case issueStatus.pricingConfirmed:
        return 'Pricing Confirmed';
      case issueStatus.paymentSubmitted:
        return 'Payment Submitted';
      case issueStatus.issueShipped:
        return 'Job shipping';
      case issueStatus.issueDelivered:
        return 'Delivered';
      case issueStatus.reviewCanceled:
        return 'Review Canceled';
    }
  },
  getStatusIcon(status) {
    switch (status) {
      case issueStatus.issueCreated:
        return 'star';
      case issueStatus.printingDataConfirmed:
        return 'tune';
      case issueStatus.draftUploaded:
        return 'picture_as_pdf';
      case issueStatus.draftSubmittedForReview:
        return 'save_alt';
      case issueStatus.draftInReview:
        return 'feedback';
      case issueStatus.draftAccepted:
        return 'rate_review';
      case issueStatus.draftRejected:
        return 'thumbs_down';
      case issueStatus.draftSubmittedForPrintSchedule:
        return 'print';
      case issueStatus.pricingInReview:
        return 'more';
      case issueStatus.pricingConfirmed:
        return 'local_offer';
      case issueStatus.paymentSubmitted:
        return 'payment';
      case issueStatus.issueShipped:
        return 'local_shipping';
      case issueStatus.issueDelivered:
        return 'import_contacts';
      case issueStatus.reviewCanceled:
        return 'block';
    }
  },
};
export const ACTIONABLE_STATUS = new Set([
  issueStatus.issueCreated,
  issueStatus.reviewCanceled,
  issueStatus.draftRejected,
  issueStatus.draftUploaded,
  issueStatus.draftAccepted,
]);
export const ACTIONS_BUTTON_CAPTION = new Map([
  [issueStatus.issueCreated, 'Upload PDF'],
  [issueStatus.reviewCanceled, 'Upload PDF'],
  [issueStatus.draftRejected, 'Upload PDF'],
  [issueStatus.draftUploaded, 'Send for Print Review'],
  [issueStatus.draftAccepted, 'Submit to Print'],
]);
export const ACTIONS_METHODS = new Map([
  [issueStatus.issueCreated, 'uploadNewDraft'],
  [issueStatus.reviewCanceled, 'uploadNewDraft'],
  [issueStatus.draftRejected, 'uploadNewDraft'],
  [issueStatus.draftUploaded, 'submitForReview'],
  [issueStatus.draftInReview, 'cancelReview'],
  [issueStatus.draftSubmittedForReview, 'cancelReview'],
  [issueStatus.draftAccepted, 'submitToPrint'],
]);
export const STATUS_PROGRESS_SECUENCE = new Map([
  [issueStatus.issueCreated, 0],
  [issueStatus.reviewCanceled, 0],
  [issueStatus.draftRejected, 0],
  [issueStatus.draftUploaded, 1],
  [issueStatus.draftSubmittedForReview, 2],
  [issueStatus.draftInReview, 2],
  [issueStatus.draftAccepted, 3],
  [issueStatus.draftSubmittedForPrintSchedule, 4],
  [issueStatus.pricingInReview, 4],
  [issueStatus.pricingConfirmed, 4],
  [issueStatus.paymentSubmitted, 4],
  [issueStatus.issueShipped, 5],
  [issueStatus.issueDelivered, 6],
]);
export const STATUS_CAN_MODIFY_PRINT_SPECS = new Set([
  issueStatus.issueCreated,
  issueStatus.reviewCanceled,
  issueStatus.draftRejected,
  issueStatus.draftUploaded,
]);
