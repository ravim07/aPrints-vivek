import { Deserializable } from './deserializable.model';

export class User implements Deserializable {
  id: string;
  name: string;
  lastName: string;
  password: string;
  email: string;
  accessToken: string;
  ttl: number;
  roles: Array<string> = [];
  userType: string;

  deserialize(input: any) {
    if (input.data) {
      Object.assign(this, input.data);
    } else {
      Object.assign(this, input);
    }
    return this;
  }

}
