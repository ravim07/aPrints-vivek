import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'auth/auth.service';
import { User } from '_models';
import { UserService } from '_services';
import { OnboardingService } from '_services/onboarding.service';

@Component({
  template: ``,
})
export class AutologinComponent implements OnInit {
  redirectUrl = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
    private onboardingService: OnboardingService
  ) {}

  ngOnInit() {
    this.onboardingService.loadIdsFromStorage();
    this.redirectUrl = this.route.snapshot.queryParams['redirect-url'];
    if (this.route.snapshot.queryParams['access-token']) {
      const token = this.route.snapshot.queryParams['access-token'];
      this.userService.getUserMe(token).subscribe(
        (user: User) => {
          this.authService.logout(false);
          user.accessToken = token;
          this.authService.login(user);
          if (this.onboardingService.getRole()) {
            this.onboardingService.finishOnboarding();
          } else if (this.authService.getInvitationToken()) {
            this.authService.acceptInvitation();
          } else if (this.redirectUrl) {
            this.router.navigateByUrl(this.redirectUrl);
            this.authService.destroyRedirectUrl();
          } else {
            this.router.navigate(['/dashboard']);
          }
        },
        (errorData: any) => {
          console.error('Error', errorData);
          this.router.navigate(['/home']);
        }
      );
    } else {
      this.router.navigate(['/home']);
    }
  }
}
