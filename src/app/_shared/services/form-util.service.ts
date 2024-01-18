import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { SharedModule } from '_shared/shared.module';

@Injectable({ providedIn: SharedModule })
export class FormUtilService {
  constructor() {}

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        if (control.enabled) {
          control.markAsTouched({ onlySelf: true });
        }
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  toggleControl(control: AbstractControl) {
    if (control.disabled) {
      control.enable();
    } else {
      control.disable();
    }
  }

  enableControl(control: AbstractControl) {
    if (control.disabled) {
      control.enable();
    }
  }

  disableForm(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      control.disable();
    });
  }

  checkError(control: AbstractControl, validator: string) {
    return control.invalid && control.touched && control.hasError(validator);
  }

  checkErrorTouchedDirty(control: AbstractControl, validator: string) {
    return (
      control.invalid &&
      control.touched &&
      control.dirty &&
      control.hasError(validator)
    );
  }
}
