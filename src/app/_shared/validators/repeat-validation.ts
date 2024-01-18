import { ValidatorFn, AbstractControl } from '@angular/forms';

export function RepeatValidation(field): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      return control.value !== field.value ? {'missmatch': {value: true}} : null;
    };
  }
