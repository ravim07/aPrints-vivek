import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FormUtilService, AlertService } from '_shared/services';

@Component({
  selector: 'app-charge-account',
  templateUrl: './charge-account.component.html',
  styleUrls: ['./charge-account.component.scss']
})
export class ChargeAccountComponent implements OnInit {
  chargeAccountForm: FormGroup;
  chargeAccountGroup: FormGroup;
  formStatusClass = '';
  errorApi = '';
  amount;
  chargeAmount;
  chargeFee;

  constructor(
    public formUtil: FormUtilService,
    private alertService: AlertService,
  ) {
    this.createForm();
  }

  ngOnInit() {
  }

  resetForm() {
    this.chargeAccountGroup.get('chargeAmount').reset();
    this.chargeAccountGroup.get('description').reset();
  }

  private createForm(){
    this.chargeAccountGroup = new FormGroup({
      'chargeAmount': new FormControl(null, [Validators.required, Validators.max(1995)]),
      'description': new FormControl(null, [Validators.required]),
    });
    this.chargeAccountForm = new FormGroup({'chargeInfo': this.chargeAccountGroup});
  }

  round (value, decimalPlaces = 0) {
    const multiplier = Math.pow(10, decimalPlaces);
    return Math.round(value * multiplier + Number.EPSILON) / multiplier;
  }

  calculateTotalAndFees (e: any): void {
    const amount = e.srcElement.value;
    if(amount && amount > 0){
      const percentageFee = amount > 617 ? 0 : 0.0081;
      const flatFee = amount > 617 ? 5 : 0;
      const flatAmount = parseFloat(amount);
      const fee = (((flatAmount) * percentageFee) + flatFee);
      const chargeFee = this.round(fee, 2);
      const chargeAmount = this.round(flatAmount + chargeFee, 2);
      this.amount =  flatAmount;
      this.chargeAmount = chargeAmount;
      this.chargeFee = chargeFee;
    } else {
      this.amount = this.chargeAmount = this.chargeFee = 0;
    }
    // console.log(this.amount, this.chargeAmount, this.chargeFee);
  }

  getData() {
    if (this.chargeAccountGroup.valid) {
      return {
        amount: this.chargeAccountGroup.get('chargeAmount').value,
        description: this.chargeAccountGroup.get('description').value
      };
    } else {
      this.formUtil.validateAllFormFields(this.chargeAccountGroup);
      this.formStatusClass = '';
      this.alertService.showAlertDanger('One or more fields have an error. Please check and try again.');
    }
  }
}
