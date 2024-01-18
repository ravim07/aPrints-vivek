import { actionConfig } from './action-config.model';
import { Action, OriginData, UserData } from './action.model';
import { Deserializable } from './deserializable.model';

export class DraftFeedback extends Action implements Deserializable {
  id: string;
  dateAdded: Date;
  date: Date;
  msg: string;
  name: string;
  email: string;
  byType: string;
  draftStatus: string;
  feedbackSenderType: string;
  issueName?: string;

  deserialize(input: any) {
    Object.assign(this, input);

    if (this.dateAdded) {
      this.dateAdded = new Date(this.dateAdded);
      this.date = new Date(this.dateAdded);
    }

    const originData: OriginData = {
      publicationId: '',
      issueId: '',
      issueName: this.issueName,
    };
    const userData: UserData = {
      fullName: this.name,
      email: this.email,
    };
    Object.assign(
      this,
      actionConfig.getConfig(this.draftStatus, originData, userData, {
        msg: this.msg,
      })
    );

    return this;
  }

  getFormattedDate(date) {
    const year = date.getFullYear();
    let month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;
    let day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;
    return month + '/' + day + '/' + year;
  }
}
