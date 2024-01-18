import { BaseModel } from '_models';
import { ContributionFeedback } from './contribution-feedback.model';

export class AdvertisementEntry extends BaseModel {
  article: string;
  comment: string;
  entryDate: Date;
  uploadedFileIds: string[];
  advertiser: { id: string; name: string };
  advertisementFeedback: ContributionFeedback[];
  preventRecordAction?: boolean;
  issueName: string;
  versionStr: string;
  versionNumber: number;

  deserialize(input: any) {
    let advertisementFeedback;
    if (input._advertisementFeedback) {
      advertisementFeedback = input._advertisementFeedback;
      delete input._advertisementFeedback;
    }

    Object.assign(this, input);
    this.createdAt = new Date(this.createdAt);

    this.advertisementFeedback = [];
    if (advertisementFeedback) {
      advertisementFeedback.forEach((feedback) => {
        feedback.issueName = this.issueName;
        feedback.versionStr = this.versionStr;
        this.advertisementFeedback.push(
          new ContributionFeedback().deserialize(feedback)
        );
      });
    }

    return this;
  }
}
