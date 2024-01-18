import { Deserializable } from './deserializable.model';
import { Publication } from './publication.model';
import { role } from './role.model';

export class AccessRequest implements Deserializable {
  id: string;
  email: string;
  requestedDate: Date;
  requestType: string;
  status: string;
  user: string;
  publication: Publication;
  publicationName: string;
  userName: string;
  role: string;

  deserialize(input: any) {
    Object.assign(this, input);

    let pubName = '';
    if (input.details.publicationName) {
      pubName = input.details.publicationName;
    }

    let username = '';
    if (input.details.userName) {
      username = input.details.userName;
    }

    if (input.details) {
      delete input.details;
    }

    this.role = role.getStrRole(this.requestType);

    this.publicationName = pubName;
    this.userName = username;
    return this;
  }
}
