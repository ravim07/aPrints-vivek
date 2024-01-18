import {Component, HostListener, ViewEncapsulation} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms/';
import {MatDialogRef} from '@angular/material/dialog';
import {AuthService} from 'auth/auth.service';
import {User} from '_models';
import {ThirdPartyLoginService} from '_services/third-party-login.service';
import {UserService} from '_services/users.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login-popup',
  templateUrl: './login-popup.component.html',
  styleUrls: ['./login-popup.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LoginPopupComponent {
  loginForm: FormGroup;
  email: FormControl;
  password: FormControl;
  hidePassword = true;
  loginError = false;

  constructor(
    public dialogRef: MatDialogRef<LoginPopupComponent>,
    private userService: UserService,
    private authService: AuthService,
    private thirdPartyLoginService: ThirdPartyLoginService,
    private router: Router,
  ) {
    this.email = new FormControl(null, [Validators.required, Validators.email]);
    this.password = new FormControl(null, [Validators.required]);
    this.loginForm = new FormGroup({
      email: this.email,
      password: this.password,
    });
  }

  @HostListener('document:keydown.enter')
  onEnter() {
    this.login();
  }

  login() {
    this.loginError = false;
    const user = new User();
    user.email = this.loginForm.get('email').value.toLowerCase();
    user.password = this.loginForm.get('password').value;
    this.userService.loginUser(user).subscribe(
      (newUser: User) => {
        this.authService.login(newUser);
        const data = {
          user: newUser,
        };
        this.dialogRef.close(data);
      },
      (errorData: any) => {
        console.error('Error LoginUser', errorData);
        this.loginForm.markAllAsTouched();
        this.loginError = true;
      }
    );
  }

  goToFacebookLogin() {
    this.thirdPartyLoginService.goToFacebookLogin();
  }

  goToGoogleLogin() {
    this.thirdPartyLoginService.goToGoogleLogin();
  }

  goToForgotPassword() {
    this.router.navigate(['/forgot-password']);
    this.dialogRef.close();
  }

  register() {
    this.dialogRef.close('register');
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  getErrorMessage(control: FormControl) {
    return control.hasError('required')
      ? 'You must enter a value'
      : control.hasError('email')
        ? 'Not a valid email'
        : '';
  }
}
