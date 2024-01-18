import { BaseModel } from '_models';
import { ContributionFeedback } from './contribution-feedback.model';

export class ContributionEntry extends BaseModel {
  article: string;
  comment: string;
  entryDate: Date;
  uploadedFileIds: string[];
  contributor: { id: string; name: string };
  contributionFeedback: ContributionFeedback[];
  preventRecordAction?: boolean;
  issueName: string;
  versionStr: string;
  versionNumber: number;

  deserialize(input: any) {
    let contributionFeedback;
    if (input._contributionFeedback) {
      contributionFeedback = input._contributionFeedback;
      delete input._contributionFeedback;
    }

    Object.assign(this, input);
    this.createdAt = new Date(this.createdAt);

    this.contributionFeedback = new Array();
    if (contributionFeedback) {
      contributionFeedback.forEach((feedback) => {
        feedback.issueName = this.issueName;
        feedback.versionStr = this.versionStr;
        this.contributionFeedback.push(
          new ContributionFeedback().deserialize(feedback)
        );
      });
    }

    return this;
  }
}
