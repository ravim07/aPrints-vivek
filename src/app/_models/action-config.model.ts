import { OriginData, UserData } from './action.model';
import { issueStatus as status } from './issue-status.model';

export interface ActionConfig {
  msg: string;
  linkText: string;
  icon: string;
  subType: string;
  originData?: OriginData;
  redirectUrl?: string;
  issueName?: string;
  isAdmin: boolean;
}

export const actionConfig = {
  newContribution: 'newContribution',
  newContributionEntry: 'newContributionEntry',
  newContributionFeedback: 'newContributionFeedback',
  newMemberAdded: 'newMemberAdded',
  newDonation: 'newDonation',
  newSubscription: 'newSubscription',
  newAdPayment: 'newAdPayment',
  sendFeedback: 'sendFeedback',

  getConfig: function (
    type: string,
    originData?: OriginData,
    userData?: UserData,
    extraData?: any
  ): ActionConfig {
    const config = {
      msg: '',
      icon: 'picture_as_pdf',
      linkText: '',
      subType: 'statusChange',
      ...(userData && { userData: userData }),
      ...(originData && { originData: originData }),
      ...(extraData &&
        extraData.redirectUrl && { redirectUrl: extraData.redirectUrl }),
      ...(extraData && extraData.msg && { msg: extraData.msg }),
      ignore: false,
      isAdmin: false,
    };
    switch (type) {
      case actionConfig.newContribution:
        config.msg =
          originData && originData.articleTitle
            ? `New Article: ${originData && originData.articleTitle}`
            : 'New article';
        config.linkText = 'View Submission';
        config.icon = 'create';
        config.subType = 'submission';
        config.redirectUrl = this.getSubmissionUrl(originData);
        break;
      case actionConfig.newContributionEntry:
        config.msg =
          originData && originData.articleTitle
            ? `New Version ${originData && originData.articleVersion}: ${
                originData && originData.articleTitle
              }`
            : 'New Article Entry';
        config.linkText = 'View Submission';
        config.icon = 'create';
        config.subType = 'submission';
        config.redirectUrl = this.getSubmissionUrl(originData);
        break;
      case actionConfig.newContributionFeedback:
        config.msg =
          originData && originData.articleTitle
            ? `New Article Feedback: ${originData && originData.articleTitle}`
            : 'New Article Feedback';
        config.linkText = 'View Submission';
        config.icon = 'create';
        config.subType = 'submission';
        config.redirectUrl = this.getSubmissionUrl(originData);
        break;
      case actionConfig.newMemberAdded:
        config.msg = 'Added as';
        config.linkText = 'View Team';
        config.icon = 'person_add';
        config.subType = 'newMember';
        break;
      case status.issueCreated:
        config.msg = 'Issue Created';
        config.subType = 'newIssue';
        config.icon = 'insert_drive_file';
        break;
      case status.draftUploaded:
        config.linkText = 'PDF uploaded';
        config.icon = 'picture_as_pdf';
        break;
      case status.draftSubmittedForReview:
        config.linkText = 'PDF submitted for review';
        config.icon = 'picture_as_pdf';
        break;
      case actionConfig.sendFeedback:
        config.subType = 'admin-action';
        config.icon = 'privacy_tip';
        config.isAdmin = true;
        console.log(config);
        break;
      case status.reviewCanceled:
        config.linkText = 'PDF review cancelled';
        config.icon = 'picture_as_pdf';
        break;
      case status.draftRejected:
        config.subType = 'admin-action';
        config.linkText = 'PDF modification request';
        config.icon = 'privacy_tip';
        config.isAdmin = true;
        break;
      case status.draftAccepted:
        config.subType = 'admin-action';
        config.linkText = 'PDF approved';
        config.icon = 'privacy_tip';
        config.isAdmin = true;
        break;
      case status.pricingInReview:
        config.linkText = 'PDF submitted for printing';
        config.icon = 'picture_as_pdf';
        break;
      case status.issueShipped:
        config.linkText = 'Issue shipped';
        config.icon = 'picture_as_pdf';
        break;
      case status.issueDelivered:
        config.subType = 'admin-action';
        config.linkText = 'Issue delivered';
        config.icon = 'privacy_tip';
        config.isAdmin = true;
        break;
      case actionConfig.newDonation:
        config.msg = 'Donation';
        config.linkText = extraData.linkText;
        config.icon = 'attach_money';
        config.subType = 'newPayment';
        break;
      case actionConfig.newSubscription:
        config.msg = 'Subscription';
        config.linkText = extraData.linkText;
        config.icon = 'card_membership';
        config.subType = 'newPayment';
        break;
      case actionConfig.newAdPayment:
        config.msg = 'Ad Plan payment';
        config.linkText = extraData.linkText;
        config.icon = 'monetization_on';
        config.subType = 'newPayment';
        break;
      default:
        config.ignore = true;
    }
    return config;
  },

  getSubmissionUrl(originData) {
    return (
      `dashboard/publication/` +
      `${originData.publicationId}/issues/` +
      `${originData.issueId}/submissions/${originData.articleId}`
    );
    return '';
  },
};
