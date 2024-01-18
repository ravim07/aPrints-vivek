import { BaseModel } from './base.model';

class UploadedFile extends BaseModel {
  name: string;
  publisherId: string;
  publicId: string;
  type: string;
  format: string;
  etag: string;
  url: string;
  thumbUrl: string;
  thumbSecureUrl: string;
  thumbPublicId: string;
  modifiedAt: string;
}

export class AdvertisementFeedback extends BaseModel {
  msg: string;
  dateAdded: Date;
  name: string;
  email: string;
  contributionId?: string;
  feedbackSenderId?: string;
  feedbackSenderType?: string;
  feedbackFile?: UploadedFile;
  issueName: string;
  versionStr: string;

  deserialize(input: any) {
    this.createdAt = new Date(input.dateAdded);
    this.dateAdded = new Date(input.dateAdded);
    Object.assign(this, input);
    return this;
  }
}
