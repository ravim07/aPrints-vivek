import { actionConfig } from './action-config.model';
import { Action, OriginData, UserData } from './action.model';
import { Deserializable } from './deserializable.model';
import { role } from './role.model';

export class Member extends Action implements Deserializable {
  id: string;
  email: string;
  name: string;
  lastName: string;
  role: string;
  roleLiteral: string;
  owner: boolean;
  dateAdded: Date;
  publicationId: string;
  status = 'active';

  deserialize(input: any) {
    // console.log(input);
    this.owner = false;
    Object.assign(this, input);
    const originData: OriginData = {
      publicationId: this.publicationId,
    };
    const userData: UserData = {
      fullName: this.name + (this.lastName ? ' ' + this.lastName : ''),
      userId: this.id,
      email: this.email,
    };
    Object.assign(
      this,
      actionConfig.getConfig('newMemberAdded', originData, userData)
    );
    return this;
  }

  assignDate(dateArr: string[]) {
    this.dateAdded = new Date(dateArr[this.id]);
  }

  finishActionConfig(obj: any) {
    let p = ' a ';
    if (obj.role === role.editorialStaff || obj.role === role.advertiser) {
      p = ' an ';
    }
    obj.msg = obj.msg + p + obj.roleLiteral;
    obj.redirectUrl = `/dashboard/publication/${obj.publicationId}/members`;
  }
}
