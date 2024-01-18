import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { distinctUntilChanged } from 'rxjs/operators';

import { AlertService } from '_shared/services';
import { PaymentMethod, PaymentMetadata } from '_models';
import { Issue } from '_models/issue.model';
import { PaymentService, StatesService, IssueService } from '_services';
import { FormUtilService } from '_shared/services';
import { Element as StripeElement } from 'ngx-stripe';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-payment-info',
  templateUrl: './payment-info.component.html',
  styleUrls: ['./payment-info.component.scss']
})
export class PaymentInfoComponent implements OnInit {
  assetsUrl = environment.assetsUrl;
  issue: Issue;
  states: Array<string> = [];
  paymentMethods: Array<string> = ['Credit Card', 'ACH', 'Check', 'Other'];
  accountHolderTypes: Array<string> = ['Individual', 'Company'];
  formStatusClass = '';
  errorApi = '';
  card: StripeElement;
  isStripe = false;
  isACH = false;
  isOther = false;
  paymentType: string;
  paymentForm: FormGroup;
  paymentGroup: FormGroup;
  data;
  _issueId: string;
  _isAdmin: boolean;
  numberOfColsWidth = 10;
  selected: 'Credit Card';

  @Input()
  set issueId(val: string) {
    this._issueId = val;
  }

  @Input()
  set isAdmin(val: boolean) {
    if (val) {
      this._isAdmin = val;
      this.paymentMethods = this.paymentMethods.filter(e => e !== 'Credit Card');
      this.numberOfColsWidth = 12;
    }
  }

  @Input()
  set setDefaults(val: any) {
    if (val) {
      this._isAdmin = val;
      this.paymentMethods = this.paymentMethods.filter(e => e !== 'Credit Card');
      this.numberOfColsWidth = 12;
    }
  }

  constructor(
    public formUtil: FormUtilService,
    private alertService: AlertService,
    private stateService: StatesService,
    private paymentService: PaymentService,
    private issueService: IssueService,
  ) {
    this.stateService.getStates().subscribe(states => this.states = states);
    this.createForm();
  }

  ngOnInit() {
    this.paymentGroup.get('paymentMethod')
    .valueChanges
    .pipe(distinctUntilChanged())
    .subscribe(async method => {
      this.paymentType = method;
      this.resetForm();
      switch (method) {
        case 'Credit Card':
          this.setForACH(false);
          await this.setForStripe();
          this.setForOther(false);
        break;
        case 'ACH':
          await this.setForStripe(false);
          this.setForACH();
          this.setForOther(false);
        break;
        default:
          this.setForACH(false);
          await this.setForStripe(false);
          this.setForOther();
        break;
        }
    });
    if (this._issueId) {
      this.initForm();
    }
  }

  initForm() {
    this.issueService.getIssue(this._issueId).subscribe(
      (issue: Issue) => {
        this.issue = issue;
        const defaults = this.issue.paymentMethod ? this.issue.paymentMethod : new PaymentMethod();
        const paymentDetails = defaults.metadata ? defaults.metadata : new PaymentMetadata();
        this.paymentGroup.controls['accountHolderType'].setValue(paymentDetails.accountHolderType);
        this.paymentGroup.patchValue({
          'firstName': paymentDetails.name,
          'lastName': paymentDetails.lastName,
          'email': defaults.email,
          'address1': paymentDetails.address1,
          'address2': paymentDetails.address2,
          'city': paymentDetails.city,
          'state': paymentDetails.state,
          'zip': paymentDetails.zip,
          'phone': paymentDetails.phone,
          'accountNumber': paymentDetails.accountNumber,
          'routingNumber': paymentDetails.routingNumber,
          'otherDetail': paymentDetails.otherDetail,
        });
        this.paymentGroup.controls['paymentMethod'].setValue('Credit Card');
      }
    );
  }

  private resetForm() {
    this.paymentGroup.get('firstName').reset();
    this.paymentGroup.get('lastName').reset();
    this.paymentGroup.get('email').reset();
    this.paymentGroup.get('address1').reset();
    this.paymentGroup.get('address2').reset();
    this.paymentGroup.get('city').reset();
    this.paymentGroup.get('state').reset();
    this.paymentGroup.get('zip').reset();
    this.paymentGroup.get('phone').reset();
    this.paymentGroup.get('accountNumber').reset();
    this.paymentGroup.get('routingNumber').reset();
    this.paymentGroup.get('otherDetail').reset();
  }

  private async setForStripe(toSet = true) {
    this.isStripe = this.paymentType === 'Credit Card';
    if (toSet) {
      this.card = await this.paymentService.initCard(this.card);
      this.paymentGroup.get('address1').setValidators([Validators.required]);
      this.paymentGroup.get('address1').updateValueAndValidity();
      this.paymentGroup.get('city').setValidators([Validators.required]);
      this.paymentGroup.get('city').updateValueAndValidity();
      this.paymentGroup.get('state').setValidators([Validators.required]);
      this.paymentGroup.get('state').updateValueAndValidity();
      this.paymentGroup.get('zip').setValidators([
        Validators.required, Validators.pattern(/^[0-9]{5}(?:-[0-9]{4})?$/)
      ]);
      this.paymentGroup.get('zip').updateValueAndValidity();
      this.paymentGroup.get('phone').setValidators([Validators.required]);
      this.paymentGroup.get('phone').updateValueAndValidity();
    } else {
      if (this.card) { this.card.clear(); }
      this.paymentGroup.get('address1').clearValidators();
      this.paymentGroup.get('city').clearValidators();
      this.paymentGroup.get('state').clearValidators();
      this.paymentGroup.get('zip').clearValidators();
      this.paymentGroup.get('phone').clearValidators();
    }
  }

  private setForACH(toSet = true) {
    this.isACH = this.paymentType === 'ACH';
    if (toSet) {
      this.paymentGroup.get('accountNumber').setValidators([Validators.required]);
      this.paymentGroup.get('accountNumber').updateValueAndValidity();
      this.paymentGroup.get('routingNumber').setValidators([Validators.required, this.routingNumberValidator]);
      this.paymentGroup.get('routingNumber').updateValueAndValidity();
      this.paymentGroup.get('accountHolderType').setValidators([Validators.required]);
      this.paymentGroup.get('accountHolderType').updateValueAndValidity();
    } else {
      this.paymentGroup.get('accountNumber').clearValidators();
      this.paymentGroup.get('routingNumber').clearValidators();
      this.paymentGroup.get('accountHolderType').clearValidators();
      this.paymentGroup.get('zip').clearValidators();
    }
  }

  private setForOther(toSet = true) {
    this.isOther = this.paymentType === 'Other';
    if (!toSet) {
      this.paymentGroup.get('firstName').setValidators([Validators.required]);
      this.paymentGroup.get('firstName').updateValueAndValidity();
      this.paymentGroup.get('lastName').setValidators([Validators.required]);
      this.paymentGroup.get('lastName').updateValueAndValidity();
      this.paymentGroup.get('email').setValidators([Validators.required, Validators.email]);
      this.paymentGroup.get('email').updateValueAndValidity();
    } else {
      this.paymentGroup.get('firstName').clearValidators();
      this.paymentGroup.get('lastName').clearValidators();
      this.paymentGroup.get('email').clearValidators();
    }
  }

  private async createForm() {
    this.paymentGroup = new FormGroup({
      'paymentMethod': new FormControl(null),
      'firstName': new FormControl(null),
      'lastName': new FormControl(null),
      'email': new FormControl(null),
      'address1': new FormControl(''),
      'address2': new FormControl(''),
      'city': new FormControl(null),
      'state': new FormControl(null),
      'zip': new FormControl(null),
      'phone': new FormControl(null),
      'accountNumber': new FormControl(null),
      'routingNumber': new FormControl(null),
      'accountHolderType': new FormControl(null),
      'otherDetail': new FormControl(null),
    });
    this.paymentForm = new FormGroup({'paymentInfo': this.paymentGroup});
  }

  private routingNumberValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (control.value !== undefined && (isNaN(control.value))) {
      let aba = control.value;
      const numericRegex = /^\d{9}$/;
      let total = null;
      // just in cases
      aba = aba.toString();
      // make sure it's numeric and of length 9
      if ( !numericRegex.test( aba ) ) {
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

  getChargeData() {
    if (this.paymentGroup.valid) {
      const userInfo = {
        email: this.paymentGroup.get('email').value,
        name: this.paymentGroup.get('firstName').value,
        lastName: this.paymentGroup.get('lastName').value,
        phone: this.paymentGroup.get('phone').value ?
                this.paymentGroup.get('phone').value : '',
      };
      switch (this.paymentType) {
        case 'Credit Card':
          return {
            ...userInfo,
            mailingAddress: {
              addressedTo: userInfo.name + ' ' + userInfo.lastName,
              address1: this.paymentGroup.get('address1').value,
              address2: this.paymentGroup.get('address2').value ?
                this.paymentGroup.get('address2').value : '',
              city: this.paymentGroup.get('city').value,
              state: this.paymentGroup.get('state').value,
              zip: this.paymentGroup.get('zip').value,
              shipTo: ''
            }
          };
        case 'ACH':
          return {
            ...userInfo,
            accountHolderType: this.paymentGroup.get('accountHolderType').value,
            routingNumber: this.paymentGroup.get('routingNumber').value,
            accountNumber: this.paymentGroup.get('accountNumber').value,
          };
        case 'Other':
          return {
            otherDetail: this.paymentGroup.get('otherDetail').value,
          };
        default:
          return {
            ...userInfo,
          };
      }
    } else {
      this.formUtil.validateAllFormFields(this.paymentGroup);
      this.formStatusClass = '';
      this.alertService.showAlertDanger('One or more fields have an error. Please check and try again.');
    }
  }

  createCardChargeData() {
    return this.paymentService.createCardToken({ // Creates card token
      card: this.card,
      firstName: this.paymentGroup.get('firstName').value,
      lastName: this.paymentGroup.get('lastName').value,
      address1: this.paymentGroup.get('address1').value,
      address2: this.paymentGroup.get('address2').value,
      city: this.paymentGroup.get('city').value,
      state: this.paymentGroup.get('state').value,
      zip: this.paymentGroup.get('zip').value,
    });
  }

  createBankAccountChargeData() {
    return this.paymentService.createBankAccountToken({ // Creates card token
      accountHolderType: this.paymentGroup.get('accountHolderType').value,
      routingNumber: this.paymentGroup.get('routingNumber').value,
      accountNumber: this.paymentGroup.get('accountNumber').value,
      firstName: this.paymentGroup.get('firstName').value,
      lastName: this.paymentGroup.get('lastName').value,
      address1: this.paymentGroup.get('address1').value,
      address2: this.paymentGroup.get('address2').value,
      city: this.paymentGroup.get('city').value,
      state: this.paymentGroup.get('state').value,
      zip: this.paymentGroup.get('zip').value,
    });
  }
}
