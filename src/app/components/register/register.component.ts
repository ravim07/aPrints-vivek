import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'auth/auth.service';
import { environment } from 'environments/environment';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { Invitation, PublicationPreview, role, User } from '_models';
import {
  InvitationService,
  LoginService,
  ReviewService,
  UserService,
} from '_services';
import { AlertService } from '_shared/services';

@Component({
  selector: 'app-register-from-publication',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  providers: [ReviewService],
})
export class RegisterPubComponent implements OnInit, OnDestroy {
  assetsUrl = environment.assetsUrl;
  registerForm: FormGroup;
  errorApi: string;
  formStatusClass = '';
  tokenInvitation = '';
  invitationData;
  registerFromRequestAccess = '';
  publication: PublicationPreview;
  role: string;
  roleString;
  url: string;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private invitationService: InvitationService,
    private route: ActivatedRoute,
    private router: Router,
    private loginService: LoginService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    const params = this.route.snapshot.params; // console.log('TEST', params, this.route.snapshot.url);
    if (this.route.snapshot.url[2]) {
      this.route.data.pipe(untilDestroyed(this)).subscribe((data) => {
        this.role = data.role;
        this.publication = data.publication;
        switch (this.role) {
          case role.subscriber:
            this.roleString = 'a Subscriber';
            break;
          case role.advertiser:
            this.roleString = 'an Advertiser';
            break;
        }
      });
      switch (this.route.snapshot.url[2].path) {
        case 'subscribe':
          this.url = `publication/${params['publicationId']}/subscribe/${params['subscriptionTypeId']}/pay`;
          break;
        case 'advertise':
          this.url = `publication/${params['publicationId']}/advertise/${params['pageAdPricingId']}/pay`;
          break;
      }
    } else {
      this.tokenInvitation = this.route.snapshot.queryParams['invitation']; // console.log(this.tokenInvitation);
      if (this.route.snapshot.url[0].path === 'referral') {
        this.url = 'dashboard/referrals';
      }
      if (this.tokenInvitation) {
        this.invitationService.acceptReferral(this.tokenInvitation).subscribe(
          (invitation: Invitation) => {
            this.alertService.showAlertSuccess('Invitation accepted');
            this.url = 'onboarding/managingEditor/createPublication';
          },
          (errorData) => {
            this.alertService.showAlertDangerApiError(errorData);
          }
        );
      }
    }
    this.createRegisterForm();
  }

  createRegisterForm() {
    this.registerForm = new FormGroup({
      fullname: new FormControl(null, [
        Validators.required,
        Validators.minLength(6),
      ]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [
        Validators.required,
        Validators.minLength(8),
      ]),
    });
  }

  loginAndRedirect(newUser) {
    this.authService.login(newUser);
    this.router.navigateByUrl(this.url);
  }

  registerUser() {
    this.formStatusClass = 'form-inprogress-submit';
    this.errorApi = '';

    if (this.registerForm.valid) {
      const user = new User(),
        fullname = this.registerForm.get('fullname').value.trim(),
        fullNameParts = fullname.split(' ');
      user.email = this.registerForm.get('email').value.toLowerCase();
      user.password = this.registerForm.get('password').value;
      user.lastName = '';
      if (fullNameParts.length > 1) {
        user.lastName = fullNameParts[fullNameParts.length - 1];
      }
      user.name = fullname.replace(user.lastName, '').trim();

      this.userService.registerUser(user).subscribe(
        (newUser: User) => {
          if (newUser.name === 'ValidationError') {
            this.errorApi = 'The email already exists';
            this.formStatusClass = '';
          } else {
            if (this.tokenInvitation) {
              this.authService.login(newUser);
              this.router.navigateByUrl(this.url);
            } else {
              this.loginAndRedirect(newUser);
            }
          }
        },
        (errorData: any) => {
          console.error('Error', errorData);
          this.errorApi = 'The email already exists';
          this.formStatusClass = '';
        }
      );
    } else {
      Object.keys(this.registerForm.controls).forEach((field) => {
        const control = this.registerForm.get(field);
        control.markAsTouched({ onlySelf: true });
      });
      this.formStatusClass = '';
    }
  }

  resetRegisterError() {
    this.errorApi = '';
  }

  goToFacebookLogin() {
    window.location.href = environment.loginFacebookUrl;
  }

  goToGoogleLogin() {
    window.location.href = environment.loginGoogleUrl;
  }

  goToLogin() {
    // this.router.navigate([{ outlets: { popup: 'login' } }], {
    //   queryParamsHandling: 'preserve',
    // });
    this.loginService.loginDialog();
  }

  ngOnDestroy() {}
}
