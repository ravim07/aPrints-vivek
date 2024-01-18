import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { AlertService } from '_shared/services';
import { RegisterValidator } from 'auth/register/register-validator';
import { UserService } from '_services';
import { FormUtilService } from '_shared/services';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  accessToken: string;
  form: FormGroup;
  formStatusClass = '';
  errorApi = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public formUtil: FormUtilService,
    private userService: UserService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    if (this.route.snapshot.queryParams['access_token']) {
      this.createForm();
      this.accessToken = this.route.snapshot.queryParams['access_token'];
    } else {
      this.router.navigate(['/home']);
    }
  }

  createForm() {
    this.form = new FormGroup({
      'password': new FormControl(null, [Validators.required, Validators.minLength(8)]),
      'confirmPassword': new FormControl(null, [Validators.required, Validators.minLength(8)])
    }, {
        validators: RegisterValidator.validate.bind(this)
      });
  }

  saveForm() {
    this.formStatusClass = 'form-inprogress-submit';
    this.errorApi = '';

    if (this.form.valid) {
      this.userService.resetPassword(this.accessToken, this.form.get('password').value).subscribe(
        () => {
          this.router.navigateByUrl('/home(popup:login)');
        },
        errorData => {
          this.errorApi = this.alertService.errorApiToString(errorData);
          this.formStatusClass = '';
        }
      );
    } else {
      this.formUtil.validateAllFormFields(this.form);
      this.formStatusClass = '';
    }
  }

}
