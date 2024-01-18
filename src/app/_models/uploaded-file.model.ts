import { BaseModel } from '_models';

export class UploadedFile extends BaseModel {
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
  belongsTo: {
    publicationId?: string;
    issueId?: string;
    contributionId?: string;
    discussionEntryId?: string;
    issueDraftId?: string;
  };
  modifiedAt: Date;

  deserialize(input: any) {
    // console.log(input);
    if (this.modifiedAt) {
      this.modifiedAt = new Date(this.modifiedAt);
    }
    Object.assign(this, input);
    return this;
  }
}
