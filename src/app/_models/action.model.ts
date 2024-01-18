import { actionConfig } from './action-config.model';
import { Deserializable } from './deserializable.model';
export interface OriginData {
  publicationId: string;
  issueId?: string;
  issueName?: string;
  articleId?: string;
  articleTitle?: string;
  articleVersion?: number;
}
export interface UserData {
  userId?: string;
  fullName: string;
  email: string;
}
export class Action implements Deserializable {
  msg: string;
  type: string;
  subType: string;
  dateAdded: Date;
  originData: OriginData;
  userData: UserData;
  redirectUrl: string;
  icon: string;
  linkText: string;
  deserialize(input: any) {
    if (input.created) {
      this.dateAdded = new Date(input.created);
      delete input.created;
    }
    Object.assign(this, input);
    Object.assign(this, actionConfig.getConfig(this.type, this.originData));
    return this;
  }
}
