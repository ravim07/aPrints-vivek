import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { UserService } from '_services';
import { FormUtilService } from '_shared/services';
// import { AuthService } from 'auth/auth.service';
@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  form: FormGroup;
  formStatusClass = '';
  sent = false;
  errorApi = '';

  constructor(
    // private authService: AuthService,
    public formUtil: FormUtilService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.form = new FormGroup({
      'email': new FormControl(null, [Validators.required, Validators.email]),
    });
  }

  saveForm() {
    this.formStatusClass = 'form-inprogress-submit';
    this.errorApi = '';
    this.sent = false;

    if (this.form.valid) {
      this.userService.forgotPassword(this.form.get('email').value).subscribe(
        data => {
          this.formStatusClass = '';
          this.sent = true;
        },
        errorData => {
          this.errorApi = 'The email address ' + this.form.get('email').value + ' is not registered.';
          this.formStatusClass = '';
        }
      );
    } else {
      this.formUtil.validateAllFormFields(this.form);
      this.formStatusClass = '';
    }
  }
}
