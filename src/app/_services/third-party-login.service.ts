import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'auth/auth.service';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ThirdPartyLoginService {
  tokenInvitation = '';
  registerFromInvitation = false;
  registerFromRequestAccess = '';
  redirectUrl = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  initData() {
    this.tokenInvitation = this.route.snapshot.queryParams['join-publication'];
    this.registerFromInvitation = !!this.tokenInvitation;
    this.registerFromRequestAccess = this.route.snapshot.queryParams[
      'request-access'
    ];
    this.redirectUrl = this.route.snapshot.queryParams['redirect-url'];
  }

  setDataLoginFrom() {
    if (this.registerFromInvitation) {
      this.authService.setInvitationToken(this.tokenInvitation);
    }

    if (this.registerFromRequestAccess) {
      this.authService.setRequestAccessPublication(
        this.registerFromRequestAccess
      );
    }

    if (this.redirectUrl) {
      this.authService.setRedirectUrl(this.redirectUrl);
    }
  }

  goToFacebookLogin() {
    this.setDataLoginFrom();
    window.location.href = environment.loginFacebookUrl;
  }

  goToGoogleLogin() {
    this.setDataLoginFrom();
    window.location.href = environment.loginGoogleUrl;
  }
}
