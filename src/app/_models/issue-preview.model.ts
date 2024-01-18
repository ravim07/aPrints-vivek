import { Deserializable } from './deserializable.model';

export class IssuePreview implements Deserializable {
  id: string;
  publicationId: string;
  publicationName: string;
  publicationDescription: string;
  issueName: string;
  issueDescription: string;
  issueNumber: string;
  issueCoverImage: string;
  coverImage: string;
  organization: string;
  deliveryDate: Date;

  deserialize(input: any) {
    this.id = input.issue.issueId;
    this.publicationId = input._id;
    this.publicationName = input.issue.publicationName;
    this.publicationDescription = input.issue.publicationDescription ? input.issue.publicationDescription : '';
    this.issueName = input.issue.issueName;
    this.issueDescription = input.issue.issueDescription ? input.issue.issueDescription : '';
    this.issueNumber = input.issue.issueNumber;
    this.organization = input.issue.organization;
    if (input.issue.issueCoverImage) {
      this.issueCoverImage = input.issue.issueCoverImage.publicUrl ? input.issue.issueCoverImage.publicUrl : null;
    }
    if (input.issue.deliveryDate) {
      this.deliveryDate = new Date(input.issue.deliveryDate);
    }
    return this;
  }

}
