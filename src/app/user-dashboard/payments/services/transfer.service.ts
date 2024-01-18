import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransferService {

  stripeAccountObs = new BehaviorSubject(undefined);

  public addBankAccountEvent = new EventEmitter();
  public transferFundsEvent = new EventEmitter();
  public onTransferComplete = new EventEmitter();

  constructor() {
  }

  addBankAction() {
    this.addBankAccountEvent.emit();
  }

  transferFundsAction() {
    this.transferFundsEvent.emit();
  }

  getStripeAccount() {
    return this.stripeAccountObs;
  }

  setStripeAccount(value) {
    this.stripeAccountObs.next(value);
  }

  transferComplete() {
    return this.onTransferComplete.emit();
  }

}
