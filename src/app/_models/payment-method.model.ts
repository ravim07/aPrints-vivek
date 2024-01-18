import { Deserializable } from './deserializable.model';
import { PaymentMetadata } from './payment-metadata.model';

export class PaymentMethod implements Deserializable {
  id: string = null;
  email: string = null;
  type: string = null;
  metadata: PaymentMetadata = new PaymentMetadata();

  deserialize(input: any) {
    if (input.metadata) {
      this.metadata = new PaymentMetadata().deserialize(input.metadata);
      delete input.metadata;
    }
    Object.assign(this, input);
    return this;
  }
}
