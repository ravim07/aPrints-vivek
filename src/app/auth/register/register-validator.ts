import { FormGroup } from '@angular/forms';

export class RegisterValidator {
  static validate(registrationFormGroup: FormGroup) {
    const password = registrationFormGroup.get('password').value;
    const confirmPassword = registrationFormGroup.get('confirmPassword').value;

    if (!confirmPassword) {
      return null;
    } else if (confirmPassword.length >= password.length && confirmPassword !== password) {
      return { doesMatchPassword: true };
    }
    return null;
  }
}
