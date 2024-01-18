import { Deserializable } from '_models';
import { PaymentSource } from './payment-source.model';

export class CustomerAccount implements Deserializable {
  id: string;
  name: string;
  customerId: string;
  sources: Array<PaymentSource>;
  createdAt: Date;

  deserialize(input: any) {

    let sources;
    if (input._sources) {
      sources = input._sources;
      delete input._sources;
    }

    Object.assign(this, input);

    if (this.createdAt) {
      this.createdAt = new Date(this.createdAt);
    }

    this.sources = new Array();
    if (sources) {
      sources.forEach(source => {
        this.sources.push(new PaymentSource().deserialize(source));
      });
    }
    return this;
  }
}