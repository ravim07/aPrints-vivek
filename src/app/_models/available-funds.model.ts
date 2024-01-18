import { Deserializable } from './deserializable.model';

export class AvailableFunds implements Deserializable {
  totalAvailable: number;
  totalDisc: number;
  totalDons: number;
  totalSubs: number;
  totalTransfers: number;
  totalAdPayments: number;
  subscriptionsQuantity;
  discountsQuantity;
  donationsQuantity;
  transfersQuantity;
  adPaymentsQuantity;
  withdrawalsQuantity;
  totalWithdrawals;
  usedFromFunds;
  numberOfUsedFunds;
  lastChecked: Date;

  deserialize(input: any) {
    Object.assign(this, input);
    return this;
  }
}
