import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

import { AlertService, FormUtilService } from '_shared/services';
import { PaymentService } from '_services';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-bank-account-info',
  templateUrl: './bank-account-info.component.html',
  styleUrls: ['./bank-account-info.component.scss']
})
export class BankAccountInfoComponent implements OnInit {
  assetsUrl = environment.assetsUrl;
  accountHolderTypes: Array<string> = ['Individual', 'Company'];
  formStatusClass = '';
  errorApi = '';
  isStripe = false;
  bankAccountInfoForm: FormGroup;
  bankAccountInfoGroup: FormGroup;
  data;

  constructor(
    public formUtil: FormUtilService,
    private alertService: AlertService,
    private paymentService: PaymentService,
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.resetForm();
  }

  resetForm() {
    this.bankAccountInfoGroup.get('firstName').reset();
    this.bankAccountInfoGroup.get('lastName').reset();
    this.bankAccountInfoGroup.get('accountNumber').reset();
    this.bankAccountInfoGroup.get('routingNumber').reset();
  }

  getChargeData() {
    if (this.bankAccountInfoGroup.valid) {
      return {
        name: this.bankAccountInfoGroup.get('firstName').value,
        lastName: this.bankAccountInfoGroup.get('lastName').value,
        accountHolderType: this.bankAccountInfoGroup.get('accountHolderType').value,
        routingNumber: this.bankAccountInfoGroup.get('routingNumber').value,
        accountNumber: this.bankAccountInfoGroup.get('accountNumber').value,
      };
    } else {
      this.formUtil.validateAllFormFields(this.bankAccountInfoGroup);
      this.formStatusClass = '';
      this.alertService.showAlertDanger('One or more fields have an error. Please check and try again.');
    }
  }

  createBankAccountChargeData() {
    return this.paymentService.createBankAccountToken({ // Creates bank account token
      accountHolderType: this.bankAccountInfoGroup.get('accountHolderType').value,
      routingNumber: this.bankAccountInfoGroup.get('routingNumber').value,
      accountNumber: this.bankAccountInfoGroup.get('accountNumber').value,
      firstName: this.bankAccountInfoGroup.get('firstName').value,
      lastName: this.bankAccountInfoGroup.get('lastName').value,
    });
  }

  private async createForm() {
    this.bankAccountInfoGroup = new FormGroup({
      'firstName': new FormControl(null, [Validators.required]),
      'lastName': new FormControl(null, [Validators.required]),
      'accountNumber': new FormControl(null, [Validators.required]),
      'routingNumber': new FormControl(null, [Validators.required, this.routingNumberValidator]),
      'accountHolderType': new FormControl(null, [Validators.required]),
    });
    this.bankAccountInfoForm = new FormGroup({ 'paymentInfo': this.bankAccountInfoGroup });
  }

  private routingNumberValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (control.value !== undefined && (isNaN(control.value))) {
      let aba = control.value;
      const numericRegex = /^\d{9}$/;
      let total = null;
      // just in cases
      aba = aba.toString();
      // make sure it's numeric and of length 9
      if (!numericRegex.test(aba)) {
        return null;
      }
      // compute checksum
      for (let i = 0; i < 9; i += 3) {
        total += parseInt(aba.charAt(i), 10) * 3
          + parseInt(aba.charAt(i + 1), 10) * 7
          + parseInt(aba.charAt(i + 2), 10);
      }
      if (total !== 0 && total % 10 === 0) {
        return { 'routingNumber': true };
      }
    }
    // still here? That's not good.
    return null;
  }
}
