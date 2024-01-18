import { Deserializable } from './deserializable.model';

export class PageAdPricing implements Deserializable {
  id: string;
  type: string;
  typeLiteral: string;
  description: string;
  numberOfIssues: number;
  chargeAmount = 0;
  chargeFee = 0;
  amount: any;
  publicationId: string;
  status: string;
  addedBy: string;
  addedDate: Date;
  updatedBy: string;
  updatedDate: Date;
  active: boolean;
  editable: boolean;
  editActive = false;

  deserialize(input: any) {
    Object.assign(this, input);

    if (this.addedDate) {
      this.addedDate = new Date(this.addedDate);
    }

    if (this.updatedDate) {
      this.updatedDate = new Date(this.updatedDate);
    }

    if (this.amount > 0) {
      this.calculateTotalAndFees(this.amount);
    }
    this.active = this.isPublished();
    this.editable = this.isEditable();
    return this;
  }

  isPublished() {
    return (
      this.status === 'enabled' ||
      this.status === 'amountLocked' ||
      this.status === 'editable'
    );
  }

  isEditable() {
    if (this.status === 'amountLocked' || this.status === 'disabledAndLocked') {
      return false;
    }
    return true;
  }

  round(value, decimalPlaces = 0) {
    const multiplier = Math.pow(10, decimalPlaces);
    return Math.round(value * multiplier + Number.EPSILON) / multiplier;
  }

  calculateTotalAndFees(amount: any): void {
    const percentageFee = 0.035;
    const flatFee = 0.3;
    const flatAmount = parseFloat(amount);
    const fee = flatAmount * percentageFee + flatFee;
    const chargeFee = this.round(fee, 2);
    const chargeAmount = this.round(flatAmount + chargeFee, 2);
    this.amount = flatAmount;
    this.chargeAmount = chargeAmount;
    this.chargeFee = chargeFee;
  }
}
