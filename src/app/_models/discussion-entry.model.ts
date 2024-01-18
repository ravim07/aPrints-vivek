import { Action } from './action.model';
import { Deserializable } from './deserializable.model';

export class DiscussionEntry extends Action implements Deserializable {
  id: string;
  threadId: string;
  dateAdded: Date;
  email: string;
  name: string;
  msg: string;
  issueId?: string;
  issueName?: string;
  isAdmin: boolean;

  deserialize(input: any) {
    Object.assign(this, input);
    this.dateAdded = new Date(this.dateAdded);
    const re1 = /^[A-Za-z0-9._%+-]+@aprintis.com$/;
    const re2 = /^[A-Za-z0-9._%+-]+@beon.studio$/;
    this.isAdmin = re1.test(String(this.email)) || re2.test(String(this.email));

    if (
      this.msg &&
      this.msg.toLocaleLowerCase().indexOf('no comments added') >= 0
    ) {
      this.msg = '';
    }
    return this;
  }
}
