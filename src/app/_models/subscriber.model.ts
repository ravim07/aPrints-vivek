import { Deserializable, MailingAddress } from '_models';

export class Subscriber implements Deserializable {
  id: string;
  name: string;
  email: string;
  mailingAddress: MailingAddress;

  deserialize(input: any) {
    Object.assign(this, input);
    return this;
  }
}
