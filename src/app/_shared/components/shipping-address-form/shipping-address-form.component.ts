import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { StatesService } from '_services';
import { ShippingAddressService } from '_services/shipping-address.service';
import { AlertService } from '_shared/services';

@Component({
  selector: 'app-shipping-address-form',
  templateUrl: './shipping-address-form.component.html',
  styleUrls: ['./shipping-address-form.component.scss'],
  // encapsulation: ViewEncapsulation.None,
})
export class ShippingAddressFormComponent implements OnInit {
  shippingAddressForm: FormGroup;
  states: Observable<any>;
  publicationId: string;
  editMode: boolean;
  address: any;

  constructor(
    private statesService: StatesService,
    private alertService: AlertService,
    private shippingAddressService: ShippingAddressService,
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<ShippingAddressFormComponent>,
    @Inject(MAT_DIALOG_DATA) dialogData) {
    this.publicationId = dialogData.publicationId;
    this.editMode = dialogData.editMode;
    this.address = dialogData.address;
  }

  ngOnInit() {
    this.states = this.statesService.getStates();
    this.initForm(this.address);
  }

  initForm(data?) {
    this.shippingAddressForm = this.formBuilder.group({
      firstName: [null, [Validators.required]],
      lastName: [null, [Validators.required]],
      phone: [null, [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
        Validators.minLength(10),
        Validators.maxLength(10),
      ]],
      address1: [null, [Validators.required]],
      address2: [null, []],
      city: [null, [Validators.required]],
      state: [null, [Validators.required]],
      zip: [null, [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
        Validators.minLength(5),
        Validators.maxLength(7),
      ]],
    });

    if (this.editMode) {
      this.shippingAddressForm.patchValue(data);
    }

  }

  getErrorMessage(formControl: AbstractControl, str: string) {
    if (formControl.hasError('required')) {
      return str.charAt(0).toUpperCase() + str.slice(1) + ' is required';
    } else if (formControl.hasError('pattern')) {
      return `You must enter a valid ${ str }`;
    } else if (
      formControl.hasError('minlength') ||
      formControl.hasError('maxlength')
    ) {
      return `You must enter a valid ${ str }`;
    }
  }

  save() {
    if (this.shippingAddressForm.invalid) {
      this.alertService.showAlertDanger('Invalid Shipping Address, Please check and try again');
      return;
    }
    const addressData = this.shippingAddressForm.getRawValue();

    if (!this.editMode) {
      this.shippingAddressService.createPublicationShippingAddress(this.publicationId, addressData)
        .subscribe((result) => {
          this.close(result);
        }, (error) => {
          this.alertService.showAlertDanger(error.error.msg);
        });
    } else {
      this.shippingAddressService.updateShippingAddress(this.address.id, addressData)
        .subscribe((result) => {
          this.close(result);
        }, (error) => {
          this.alertService.showAlertDanger(error.error.msg);
        });
    }

  }

  close(data?) {
    this.dialogRef.close(data);
  }
}
