import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { environment } from 'environments/environment';
import { UserService } from '_services';
import { role, User } from '_models';
import { AuthService } from 'auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  assetsUrl = environment.assetsUrl;
  loginForm: FormGroup;
  errorLogin = false;
  formStatusClass = '';
  tokenInvitation = '';
  registerFromInvitation = false;
  registerFromRequestAccess = '';
  redirectUrl = '';


  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.tokenInvitation = this.route.snapshot.queryParams['join-publication'];
    this.registerFromInvitation = !!this.tokenInvitation;
    this.registerFromRequestAccess = this.route.snapshot.queryParams['request-access'];
    this.redirectUrl = this.route.snapshot.queryParams['redirect-url'];
    this.createLoginForm();
  }

  createLoginForm() {
    this.loginForm = new FormGroup({
      'email': new FormControl(null, [Validators.required]),
      'password': new FormControl(null, [Validators.required])
    });

  }

  closeModal($event = null) {
    this.router.navigate([{ outlets: { popup: null } }], { queryParamsHandling: 'preserve' });
  }

  loginUser() {
    this.errorLogin = false;
    this.formStatusClass = 'form-inprogress-submit';

    if (this.loginForm.valid) {
      const user = new User();
      user.email = this.loginForm.get('email').value.toLowerCase();
      user.password = this.loginForm.get('password').value;

      this.userService.loginUser(user)
        .subscribe(
          (newUser: User) => {
            this.authService.login(newUser);
            let route = '/dashboard';
            if (newUser.roles.indexOf(role.admin) >= 0) {
              route = '/admin';
            } else if (this.route.snapshot['_routerState'].url.indexOf('editorialStaff') !== -1) {
              route = '/onboarding/editorialStaff/searchPublication';
            } else if (this.route.snapshot['_routerState'].url.indexOf('subscriber') !== -1) {
              route = '/onboarding/subscriber/searchPublication';
            } else if (this.route.snapshot['_routerState'].url.indexOf('advertiser') !== -1) {
              route = '/onboarding/advertiser/searchPublication';
            } else if (this.route.snapshot['_routerState'].url.indexOf('contributor') !== -1) {
              route = '/onboarding/contributor/searchPublication';
            } else if (this.route.snapshot['_routerState'].url.indexOf('managingEditor') !== -1) {
              route = '/onboarding/managingEditor/createPublication';
            } else {
              if (this.registerFromInvitation) {
                route = '/join-publication?token=' + this.tokenInvitation;
              } else if (this.registerFromRequestAccess) {
                route = '/publication/' + this.registerFromRequestAccess;
              } else if (this.redirectUrl) {
                route = this.redirectUrl;
              }
            }
            this.router.navigateByUrl(route);
          },
          (errorData: any) => {
            console.error('Error LoginUser', errorData);
            this.errorLogin = true;
            this.formStatusClass = '';
          }
        );
    } else {
      this.formStatusClass = '';
      Object.keys(this.loginForm.controls).forEach(field => {
        const control = this.loginForm.get(field);
        control.markAsTouched({ onlySelf: true });
      });
    }
  }

  resetLoginError() {
    this.errorLogin = false;
  }

  goToFacebookLogin() {
    this.setDataLoginFrom();
    window.location.href = environment.loginFacebookUrl;
  }

  goToGoogleLogin() {
    this.setDataLoginFrom();
    window.location.href = environment.loginGoogleUrl;
  }

  private setDataLoginFrom() {
    if (this.registerFromInvitation) {
      this.authService.setInvitationToken(this.tokenInvitation);
    }

    if (this.registerFromRequestAccess) {
      this.authService.setRequestAccessPublication(this.registerFromRequestAccess);
    }

    if (this.redirectUrl) {
      this.authService.setRedirectUrl(this.redirectUrl);
    }
  }

  goToForgotPassword() {
    this.router.navigateByUrl('/forgot-password');
  }

  clickGetStarted() {
    this.router.navigateByUrl('/onboarding');
  }
}
