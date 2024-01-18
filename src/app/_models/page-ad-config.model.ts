import { Deserializable } from './deserializable.model';

export class PageAdConfig implements Deserializable {
  id: string;
  sizeType: string;
  totalSpacesAvailable: number;
  publicationId: string;
  pageAdPricingId: string;
  status: string;
  addedBy: string;
  addedDate: Date;
  updatedBy: string;
  updatedDate: Date;

  deserialize(input: any) {
    Object.assign(this, input);

    if (this.addedDate) {
      this.addedDate = new Date(this.addedDate);
    }

    if (this.updatedDate) {
      this.updatedDate = new Date(this.updatedDate);
    }
    return this;
  }

  isPublished() {
    return (this.status === 'enabled' || this.status === 'amountLocked' || this.status === 'editable');
  }

  isEditable() {
    if (this.status === 'amountLocked' || this.status === 'disabledAndLocked') {
      return false;
    }
    return true;
  }
}
