import { Deserializable } from './deserializable.model';

export class PublicationPreview implements Deserializable {
  id: string;
  organization: string;
  publicationName: string;
  description: string;
  image: string;
  downloadUrl: string;
  previewPdfUrl: string;
  fileUrl: string;
  publicId: string;
  deliveryDate: Date;
  issueId?: string;
  communityInfo: {
    description: string;
    title: string;
  };
  issuesWithDrafts: any[];
  publicationIssues: any[];
  managingEditorName: string;
  managingEditorEmail: string;

  deserialize(input: any) {
    this.id = input._id;
    this.issueId = input.currentIssue._id;
    this.organization = input.organization;
    this.publicationName = input.publicationName;
    this.managingEditorName = input.managingEditorName;
    this.managingEditorEmail = input.managingEditorEmail;
    this.description = input.publicationDescription || '';
    if (input.currentIssue.coverImage) {
      this.image = input.currentIssue.coverImage.publicUrl
        ? input.currentIssue.coverImage.publicUrl
        : null;
      this.previewPdfUrl = input.currentIssue.coverImage.previewPdfUrl
        ? input.currentIssue.coverImage.previewPdfUrl
        : null;
      this.fileUrl = input.currentIssue.coverImage.fileUrl
        ? input.currentIssue.coverImage.fileUrl
        : null;
      this.downloadUrl = input.currentIssue.coverImage.publicUrl
        ? input.currentIssue.coverImage.publicUrl
        : this.fileUrl;
      this.publicId = input.currentIssue.coverImage.publicId
        ? input.currentIssue.coverImage.publicId
        : null;
    }
    if (input.currentIssue.deliveryDate) {
      this.deliveryDate = new Date(input.currentIssue.deliveryDate);
    }
    if (input.communityInfo) {
      this.communityInfo = input.communityInfo;
    }
    if (input.publicationIssues) {
      this.publicationIssues = input.publicationIssues;
    }
    if (input.issuesWithDrafts) {
      this.issuesWithDrafts = input.issuesWithDrafts.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }
    return this;
  }

  deserializeSearchPublication(input: any) {
    this.id = input._id;
    this.organization = input.publication.organization;
    this.publicationName = input.publication.publicationName;
    this.description = input.publication.publicationDescription
      ? input.publication.publicationDescription
      : '';
    if (input.publication.coverImage) {
      this.image = input.publication.coverImage.publicUrl
        ? input.publication.coverImage.publicUrl
        : null;
    }
    return this;
  }
}
