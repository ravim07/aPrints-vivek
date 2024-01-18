import { Deserializable } from './deserializable.model';

export class UserData implements Deserializable {
  accessToken: string;
  email: string;
  id: string;
  lastName: string;
  name: string;
  publications: Object;
  roles: Object;
  loginProviders: Array<string>;

  deserialize(input: any) {
    if (input.data) {
      Object.assign(this, input.data);
    } else {
      Object.assign(this, input);
    }
    return this;
  }

}
