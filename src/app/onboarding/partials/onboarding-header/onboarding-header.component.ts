import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'auth/auth.service';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { role, User } from '_models';
import { LoginService } from '_services';

@Component({
  selector: 'app-onboarding-header',
  templateUrl: './onboarding-header.component.html',
  styleUrls: ['./onboarding-header.component.scss'],
  providers: [LoginService],
})
export class OnboardingHeaderComponent {
  assetsUrl = environment.assetsUrl;
  isAdmin = false;
  isAuthenticated$: Observable<boolean>;
  currentUser: User;
  @Input() headerclass: string;
  @Input() printisColor = '#292929';
  offsetLimit = 0;

  constructor(
    protected router: Router,
    protected authService: AuthService,
    private loginService: LoginService
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated();
    this.currentUser = this.authService.getCurrentUser();
    this.isAdmin = this.authService.isRole(role.admin);
  }

  login() {
    // this.router.navigate([{ outlets: { popup: 'login' } }], {
    //   queryParamsHandling: 'preserve',
    // });
    this.loginService.loginDialog();
  }

  register() {}

  clickGetStarted() {}
}
