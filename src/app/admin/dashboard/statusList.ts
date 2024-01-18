import { issueStatus } from '_models';

export const statuses: any = [
  '',
  'issueCreated',
  'printingDataConfirmed',
  'draftUploaded',
  'draftSubmittedForReview',
  'draftInReview',
  'draftAccepted',
  'draftRejected',
  'draftSubmittedForPrintSchedule',
  'pricingInReview',
  'pricingConfirmed',
  'paymentSubmitted',
  'issueShipped',
  'issueDelivered',
  'reviewCanceled'
].map(
  o => {
    if (o) {
      return {id: o, value: issueStatus.getStatusStrAdmin(o)};
    } else {
      return {id: '', value: ''};
    }
  }
);
