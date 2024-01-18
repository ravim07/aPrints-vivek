import { Deserializable } from './deserializable.model';
import { role } from './role.model';

export class Invitation implements Deserializable {
  email: string;
  name: string;
  lastName: string;
  inviteType: string;
  roleLiteral: string;
  inviteTargetId: string;
  inviteTargetName: string;
  linkToken: string;
  dateInvited: Date;
  dateSignup: Date;
  dateAccepted: Date;
  status: string;
  userFrom: string;
  id: string;
  daysSinceInvite: any;

  deserialize(input: any) {
    Object.assign(this, input);
    this.roleLiteral = role.getStrRole(this.inviteType);

    if (this.dateInvited) {
      this.dateInvited = new Date(this.dateInvited);
      this.daysSinceInvite = this.getDaysBetween(this.dateInvited);
    }
    if (this.dateSignup) {
      this.dateSignup = new Date(this.dateSignup);
    }
    if (this.dateAccepted) {
      this.dateAccepted = new Date(this.dateAccepted);
    }
    return this;
  }

  getDaysBetween(date: Date) {
    const now = new Date();
    const timeDiff = now.getTime() - date.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    return Math.floor(daysDiff);
  }
}
