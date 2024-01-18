import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertService, FormUtilService } from '_shared/services';

@Component({
  selector: 'app-verify-bank-account',
  templateUrl: './verify-bank-account.component.html',
  styleUrls: ['./verify-bank-account.component.scss']
})
export class VerifyBankAccountComponent implements OnInit {

  verifyBankAccountForm: FormGroup;
  verifyAmountsGroup: FormGroup;
  formStatusClass = '';
  errorApi = '';
  numberOfColsWidth = 12;

  constructor(
    public formUtil: FormUtilService,
    private alertService: AlertService,
  ) {
    this.createForm();
  }

  ngOnInit() {
  }

  resetForm() {
    this.verifyAmountsGroup.get('firstAmount').reset();
    this.verifyAmountsGroup.get('secondAmount').reset();
  }

  getAmounts() {
    if (this.verifyAmountsGroup.valid) {
      return [
        this.verifyAmountsGroup.get('firstAmount').value,
        this.verifyAmountsGroup.get('secondAmount').value
      ];
    } else {
      this.formUtil.validateAllFormFields(this.verifyAmountsGroup);
      this.formStatusClass = '';
      this.alertService.showAlertDanger('One or more fields have an error. Please check and try again.');
    }
  }

  private createForm() {
    this.verifyAmountsGroup = new FormGroup({
      'firstAmount': new FormControl(null, [Validators.required]),
      'secondAmount': new FormControl(null, [Validators.required]),
    });
    this.verifyBankAccountForm = new FormGroup({ 'verificationInfo': this.verifyAmountsGroup });
  }

}
