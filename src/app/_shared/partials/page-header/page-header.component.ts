import { Component, Input } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from 'auth/auth.service';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { role, User } from '_models';
import { LoginService } from '_services';
@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss'],
})
export class PageHeaderComponent {
  assetsUrl = environment.assetsUrl;
  isAdmin = false;
  isAuthenticated$: Observable<boolean>;
  currentUser: User;
  @Input() headerclass: string;
  // TODO: completar (busqueda)
  textQuery = '';
  offsetLimit = 0;

  constructor(
    protected router: Router,
    protected authService: AuthService,
    protected loginService: LoginService
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated();
    this.currentUser = this.authService.getCurrentUser();
    this.isAdmin = this.authService.isRole(role.admin);
  }

  setDialogConfig(panelClass: string[], data: any): MatDialogConfig {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.panelClass = panelClass;
    dialogConfig.data = data;
    return dialogConfig;
  }

  goToLogin() {
    // this.router.navigate([{ outlets: { popup: 'login' } }], { queryParamsHandling: 'preserve' });
    this.loginService.loginDialog();
  }

  logout() {
    this.authService.logout();
  }

  goToDashboard() {
    if (this.isAdmin) {
      this.router.navigateByUrl('/admin');
    } else {
      this.router.navigateByUrl('/dashboard');
    }
  }

  clickRegister() {
    if (this.authService.getCurrentUser()) {
      if (this.authService.isRole(role.admin)) {
        this.router.navigateByUrl('/admin');
      } else {
        this.router.navigateByUrl('/dashboard');
      }
    } else {
      this.router.navigateByUrl('/register');
    }
  }

  clickGetStarted() {
    if (this.authService.getCurrentUser()) {
      if (this.authService.isRole(role.admin)) {
        this.router.navigateByUrl('/admin');
      } else {
        this.router.navigateByUrl('/dashboard');
      }
    } else {
      this.router.navigateByUrl('/onboarding');
    }
  }

  makeReferral() {
    this.router.navigateByUrl('referral');
  }
}


