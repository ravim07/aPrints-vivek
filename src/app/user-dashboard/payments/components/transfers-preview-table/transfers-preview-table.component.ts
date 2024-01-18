import { Component, OnInit, Input, ViewChild, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Publication } from '_models/publication.model';
import { Transfer } from '_models/transfer.model';
import { MatDialog } from '@angular/material/dialog';
import { CustomerAccountService } from '_services';
import { CustomerAccount } from '_models';
import { PaymentSource } from '_models/payment-source.model';
import { UserPublicationsService } from 'user-dashboard/shared/services';
import { AlertService } from '_shared/services';

@Component({
  selector: 'app-transfers-preview-table',
  templateUrl: './transfers-preview-table.component.html',
  styleUrls: ['./transfers-preview-table.component.scss']
})
export class TransfersPreviewTableComponent implements OnInit, OnChanges {
  private _publication: Publication;
  loading = true;
  showCustomerAccount;
  customerAccount: CustomerAccount;
  _bankAccountInfo: PaymentSource;
  bankAccountStatus: string;
  transfers: Array<Transfer>;
  netTransferTotal = 0;
  totalAvailable = 0;
  lastChecked;

  depositButtonTitle;
  showUnlinkBankAccount = false;

  @Output()
  popupEvent = new EventEmitter<any>();

  @ViewChild('dialogConfirmRemoveCustomerAccount', {static: false}) dialogConfirmRemoveCustomerAccount;

  constructor(
    private alertService: AlertService,
    private customerAccountService: CustomerAccountService,
    private dialog: MatDialog,
    private userPublications: UserPublicationsService,
  ) { }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    // console.log("TCL: TransfersPreviewTableComponent -> ngOnInit -> changes", changes);
    this.setInfo();
    this.setTranfers();
    this.loading = false;
  }

  get publication(): Publication {
    return this._publication;
  }

  @Input()
  set publication(pub: Publication) {
    if (pub) {
      // console.log("TCL: TransfersPreviewTableComponent -> setation -> pub", pub)
      this._publication = pub;
      this.setInfo();
      this.setTranfers();
      this.loading = false;
    }
  }

  doShowCustomerAccount() {
    this.showCustomerAccount = true;
  }

  onShowCustomerAccountPopupEvent(evt) {
    if (evt.type === 'popup.closed') {
      this.showCustomerAccount = false;
      if (evt.pub) {
        this.customerAccountService.checkAvailableFunds(this._publication.id).subscribe(data => {
          this._publication = new Publication().deserialize(data.data);
          this.setTranfers();
          this.setInfo();
          this.popupEvent.emit({ type: 'popup.closed', pub: this._publication });
        });
      }
    }
  }

  setTranfers() {
    this.transfers = this._publication.transfers;
    this.netTransferTotal = this._publication.availableFunds && this._publication.availableFunds.totalTransfers || 0;
    this.totalAvailable = this._publication.availableFunds && this._publication.availableFunds.totalAvailable || 0;
    this.lastChecked = this._publication.availableFunds && this._publication.availableFunds.lastChecked || 0;
  }

  setInfo() {
    if (this._publication.customerAccounts.length > 0) {
      this.customerAccount = this._publication.customerAccounts[0];
      if (this.customerAccount.sources.length > 0) {
        this._bankAccountInfo = this.customerAccount.sources[0];
        switch (this._bankAccountInfo.status) {
          case 'new':
            this.bankAccountStatus = 'Unverified';
            this.depositButtonTitle = 'Verify Deposit Bank Account';
            this.showUnlinkBankAccount = true;
            break;
          case 'verified':
            this.bankAccountStatus = 'Verified';
            this.depositButtonTitle = 'Transfer Funds to aPrintis';
            this.showUnlinkBankAccount = true;
            break;
        }
      }
    } else {
      this.customerAccount = undefined;
      this._bankAccountInfo = undefined;
      this.bankAccountStatus = 'Unlinked';
      this.depositButtonTitle = 'Add Bank Account to Deposit';
      this.showUnlinkBankAccount = false;
    }
  }

  confirmRemoveCustomerAccount($event) {
    $event.preventDefault();
    $event.stopPropagation();

    this.dialog.open(this.dialogConfirmRemoveCustomerAccount, { panelClass: 'confirm-dialog' });
  }

  removeAccount() {
    this.customerAccountService.removeCustomerAccount(
      this._publication.id, this.customerAccount)
      .subscribe(
        (result: any) => {
          this._publication = new Publication().deserialize(result.data.pub);
          this.userPublications.update();
          this.setInfo();
          this.setTranfers();
          this.popupEvent.emit({ type: 'popup.closed', pub: this._publication });
          this.alertService.showAlertSuccess('Bank account removal successful!');
        },
        (errorData: any) => {
          this.alertService.showAlertDangerApiError(errorData);
        }
      );
  }
}
