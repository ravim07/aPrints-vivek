import { Publication } from './publication.model';

export class PublicationListItemPerms {
  showEditPub: boolean;
  showCreateIssue: boolean;
  issueMenu: boolean;
}

export class PublicationListItem {
  publication: Publication;
  id: string;
  cover: string;
  name: string;
  description: string;
  show: PublicationListItemPerms;
  numIssues: number;
  totalFunds?: number;
  members?: Array<string>;
  status?: string;

  deserialize(input: any) {
    Object.assign(this, input);
    return this;
  }
}
