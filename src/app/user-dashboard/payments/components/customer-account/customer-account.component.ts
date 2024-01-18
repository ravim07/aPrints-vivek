import { Component, OnInit, Output, EventEmitter, Input, ViewChild, SimpleChanges, OnChanges, SimpleChange } from '@angular/core';
import { PageService, AlertService, FormUtilService } from '_shared/services';
import { FormGroup } from '@angular/forms';
import { CustomerAccountService } from '_services';
import { UserPublicationsService } from 'user-dashboard/shared/services';
import { Publication } from '_models/publication.model';
import { CustomerAccount } from '_models';
import { PaymentSource } from '_models/payment-source.model';
import { ChargeAccountComponent } from '../charge-account/charge-account.component';
import { environment } from 'environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { VerifyBankAccountComponent } from 'user-dashboard/payments/components/verify-bank-account/verify-bank-account.component';
import { BankAccountInfoComponent } from 'user-dashboard/payments/components/bank-account-info/bank-account-info.component';

@Component({
  selector: 'app-customer-account',
  templateUrl: './customer-account.component.html',
  styleUrls: ['./customer-account.component.scss']
})
export class CustomerAccountComponent implements OnInit, OnChanges {

  assetsUrl = environment.assetsUrl;
  private _publication: Publication;
  customerAccount: CustomerAccount;
  _bankAccountInfo: PaymentSource;
  bankAccountStatus = 'Unlinked';
  _showPopup = false;
  popupClass = '';
  formStatusClass = '';
  errorApi = '';
  bankAccountInfoForm: FormGroup;
  verifyBankAccountForm: FormGroup;
  chargeAccountForm: FormGroup;
  @ViewChild('bankAccountInfo', {static: false}) bankAccountInfo: BankAccountInfoComponent;
  @ViewChild('verifyBankAccount', {static: false}) verifyBankAccount: VerifyBankAccountComponent;
  @ViewChild('chargeAccount', {static: false}) chargeAccount: ChargeAccountComponent;
  @ViewChild('dialogConfirmTransferFunds', {static: false}) dialogConfirmTransferFunds;
  numberOfColsWidth = 12;
  title = 'Link Deposit Bank Account';

  @Output()
  popupEvent = new EventEmitter<any>();

  constructor(
    private alertService: AlertService,
    private pageService: PageService,
    private formUtil: FormUtilService,
    private userPublications: UserPublicationsService,
    private customerAccountService: CustomerAccountService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    // console.log("TCL: CustomerAccountComponent -> ngOnInit -> ngOnInit");
  }

  ngOnChanges(changes: SimpleChanges): void {
    // console.log("TCL: CustomerAccountComponent -> changes", changes);
    this.setInfo();
  }

  get publication(): Publication {
    return this._publication;
  }

  @Input()
  set publication(val: Publication) {
    this._publication = val;
    this.setInfo();
  }

  @Input()
  set showPopup(val: boolean) {
    this._showPopup = val;
    if (this._showPopup) {
      this.createForm();
      this.popupClass = 'modal-show';
      this.pageService.addBodyClass('modal-open');
      this.setInfo();
    } else {
      this.popupClass = '';
      this.pageService.removeBodyClass('modal-open');
    }
  }

  setInfo() {
    if (this._publication.customerAccounts.length > 0) {
      this.customerAccount = this._publication.customerAccounts[0];
      if (this.customerAccount.sources.length > 0) {
        this._bankAccountInfo = this.customerAccount.sources[0];
        switch (this._bankAccountInfo.status) {
          case 'new':
            this.bankAccountStatus = 'Unverified';
            this.title = 'Verify Deposit Bank Account';
            break;
          case 'verified':
            this.bankAccountStatus = 'Verified';
            this.title = 'Transfer Funds to aPrintis';
            break;
        }
      }
    } else {
      this.customerAccount = undefined;
      this._bankAccountInfo = undefined;
      this.bankAccountStatus = 'Unlinked';
      this.title = 'Link Deposit Bank Account';
    }
  }

  createForm() {
    this.bankAccountInfoForm = new FormGroup({});
    this.verifyBankAccountForm = new FormGroup({});
    this.chargeAccountForm = new FormGroup({});
  }

  closePopup(pub?: Publication) {
    this._showPopup = false;
    this.popupClass = '';
    this.pageService.removeBodyClass('modal-open');
    this.setInfo();
    this.popupEvent.emit({ type: 'popup.closed', pub: pub });
  }

  confirmTransferFunds($event) {
    $event.preventDefault();
    $event.stopPropagation();

    this.dialog.open(this.dialogConfirmTransferFunds, { panelClass: 'confirm-dialog' });
  }

  submit() {
    this.formStatusClass = 'form-inprogress-submit';

    if (this.bankAccountInfoForm.valid) {
      this.bankAccountInfo.data = this.bankAccountInfo.getChargeData();
      this.bankAccountInfo.createBankAccountChargeData()
        .subscribe(result => {
          // console.log(result);
          if (result.token) {
            this.customerAccountService.attachCustomerAccount(
              this._publication.id,
              {
                name: this.bankAccountInfo.data.name + ' ' + this.bankAccountInfo.data.lastName,
                type: 'StripeCharge',
                stripeToken: result.token.id,
                lastFour: result.token.bank_account.last4,
                bankName: result.token.bank_account.bank_name,
              })
              .subscribe(
                (result: any) => {
                  this._publication = new Publication().deserialize(result.data.pub);
                  this.bankAccountInfo.resetForm();
                  this.userPublications.update();
                  this.popupEvent.emit({ type: 'popup.closed', pub: this._publication });
                  // this.closePopup(result.pub);
                  this.setInfo();
                  this.alertService.showAlertSuccess(
                    'Bank Account linked successfully! Verification deposits will take 1-2 business days to appear in your online statement.');
                },
                (errorData: any) => {
                  this.alertService.showAlertDanger('Bank Account Creation failed! Please make sure you gave us the correct information.');
                  this.formStatusClass = '';
                }
              );
          } else if (result.error) {
            // Error creating the token
            console.log(result.error.message);
            this.errorApi = result.error.message;
          }
        });
    } else {
      this.formUtil.validateAllFormFields(this.bankAccountInfoForm);
      this.formStatusClass = '';
      this.alertService.showAlertDanger('One or more fields have an error. Please check and try again.');
    }
  }

  submitVerification() {
    this.formStatusClass = 'form-inprogress-submit';

    if (this.verifyBankAccountForm.valid) {
      const amounts = this.verifyBankAccount.getAmounts();
      this.customerAccountService.verifyBankAccount(
        this._publication.id, {amounts})
        .subscribe(
          (result: any) => {
            this._publication = new Publication().deserialize(result.data.pub);
            this.verifyBankAccount.resetForm();
            this.userPublications.update();
            this.popupEvent.emit({ type: 'popup.closed', pub: this._publication });
            // this.closePopup();
            this.setInfo();
            this.alertService.showAlertSuccess('Bank Account verified successfully!');
          },
          (errorData: any) => {
            this.alertService.showAlertDanger('Bank Account Verification failed! Check that you gave us the correct amounts!');
            this.formStatusClass = '';
          }
        );
    } else {
      this.formUtil.validateAllFormFields(this.verifyBankAccountForm);
      this.formStatusClass = '';
      this.alertService.showAlertDanger('One or more fields have an error. Please check and try again.');
    }
  }

  submitCharge() {
    this.formStatusClass = 'form-inprogress-submit';
    // console.log(this.chargeAccount.getData());

    if (this.chargeAccountForm.valid) {
      const {amount, description} = this.chargeAccount.getData();
      this.customerAccountService.createACHCharge(
        this._publication.id, {amount, description})
        .subscribe(
          (result: any) => {
            this._publication = new Publication().deserialize(result.data.pub);
            this.chargeAccount.resetForm();
            this.userPublications.update();
            this.closePopup(this._publication);
            this.alertService.showAlertSuccess('Deposit successful! Please take in mind this will take up to 7 business days to be reflected.');
          },
          (errorData: any) => {
            this.alertService.showAlertDanger('Deposit failed, please take in mind that you cannot send an amount bigger than 1995');
            this.formStatusClass = '';
          }
        );
    } else {
      this.formUtil.validateAllFormFields(this.chargeAccountForm);
      this.formStatusClass = '';
      this.alertService.showAlertDanger('One or more fields have an error. Please check and try again.');
    }
  }

}
