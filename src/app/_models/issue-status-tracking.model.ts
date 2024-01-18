import { actionConfig } from './action-config.model';
import { OriginData, UserData } from './action.model';
import { Deserializable } from './deserializable.model';
import { issueStatus as status } from './issue-status.model';

export class IssueStatusTracking implements Deserializable {
  id: string;
  date: Date;
  dateAdded: Date;
  type: string;
  notes: string;
  byId: string;
  email: string;
  statusFrom: string;
  statusTo: string;
  byType: string;
  name: string;
  publicationIssueId: string;
  publicationId: string;
  publicationName: string;
  draftId: string;
  redirectUrl: string;
  issueName: string;

  deserialize(input: any) {
    Object.assign(this, input);
    this.date = new Date(this.date);
    this.dateAdded = this.date;
    const extraData = { msg: 'has updated the Issue!' };

    if (
      this.notes &&
      this.notes.toLocaleLowerCase().indexOf('no comments added') >= 0
    ) {
      this.notes = '';
      switch (this.statusTo) {
        case status.draftAccepted:
        case status.draftRejected:
          extraData.msg = '';
      }
    } else {
      extraData.msg = this.notes;
    }
    const originData: OriginData = {
      publicationId: this.publicationId,
      issueId: this.publicationIssueId,
      issueName: this.issueName,
    };
    const userData: UserData = {
      fullName: this.name,
      userId: this.byId,
      email: this.email,
    };
    this.redirectUrl = `/dashboard/publication/${originData.publicationId}/issues/${originData.issueId}`;
    Object.assign(
      this,
      actionConfig.getConfig(this.statusTo, originData, userData, extraData)
    );
    return this;
  }
}
