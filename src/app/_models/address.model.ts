import { BaseModel } from '_models/base.model';

export class Address extends BaseModel {

  addressTo: string;
  firstName: string;
  lastName: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  fullAddress;

  deserialize(input: any) {
    this.createdAt = new Date(this.createdAt);
    Object.assign(this, input);
    this.addressTo = `${ this.firstName } ${ this.lastName }`;
    this.fullAddress = `${ this.address1 }, ${ this.address2 || '' } ${ this.city }, ${ this.state } ${ this.zip }`;
    return this;
  }
}
