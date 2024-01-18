import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { role } from '_models';
import { LoginPopupComponent } from '_shared/components/login/login-popup.component';
import { BaseActionsService } from './base-actions.service';
import { ThirdPartyLoginService } from './third-party-login.service';

@Injectable({
  providedIn: 'root',
})
export class LoginService extends BaseActionsService {
  constructor(
    dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private thirdPartyLoginService: ThirdPartyLoginService
  ) {
    super(dialog);
  }
  loginDialog() {
    this.thirdPartyLoginService.initData();
    const dialogConfig = this.setDialogConfig(
      ['flat-dialog', 'normal', 'height-700', 'width-550', 'login-dialog'],
      { name: '', organization: '', description: '' }
    );
    dialogConfig.disableClose = false;
    this.dialog
      .open(LoginPopupComponent, dialogConfig)
      .afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe((result) => {
        console.log(result);
        if (result) {
          if (result === 'register') {
            this.router.navigate(['/onboarding']);
          } else {
            let route = '/dashboard';
            if (result.user.roles.indexOf(role.admin) >= 0) {
              route = '/admin';
            } else if (
              this.route.snapshot['_routerState'].url.indexOf(
                'editorialStaff'
              ) !== -1
            ) {
              route = '/onboarding/editorialStaff/searchPublication';
            } else if (
              this.route.snapshot['_routerState'].url.indexOf('subscriber') !==
              -1
            ) {
              route = '/onboarding/subscriber/searchPublication';
            } else if (
              this.route.snapshot['_routerState'].url.indexOf('advertiser') !==
              -1
            ) {
              route = '/onboarding/advertiser/searchPublication';
            } else if (
              this.route.snapshot['_routerState'].url.indexOf('contributor') !==
              -1
            ) {
              route = '/onboarding/contributor/searchPublication';
            } else if (
              this.route.snapshot['_routerState'].url.indexOf(
                'managingEditor'
              ) !== -1
            ) {
              route = '/onboarding/managingEditor/createPublication';
            } else {
              if (this.thirdPartyLoginService.registerFromInvitation) {
                route =
                  '/join-publication?token=' +
                  this.thirdPartyLoginService.tokenInvitation;
              } else if (
                this.thirdPartyLoginService.registerFromRequestAccess
              ) {
                route =
                  '/publication/' +
                  this.thirdPartyLoginService.registerFromRequestAccess;
              } else if (this.thirdPartyLoginService.redirectUrl) {
                route = this.thirdPartyLoginService.redirectUrl;
              }
            }
            this.router.navigateByUrl(route);
          }
        }
      });
  }
}
