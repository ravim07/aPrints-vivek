import { Injectable } from '@angular/core';
import { CanLoad, Route, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild } from '@angular/router';

import { Observable, of } from 'rxjs';
import { map, take, catchError } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { UserService } from '_services';

@Injectable()
export class AuthGuard implements CanLoad, CanActivateChild {

  constructor(private authService: AuthService, private userService: UserService) { }

  canLoad(route: Route): Observable<boolean> {
    const hasUserData = this.authService.hasUserData();
    if (hasUserData) {
      return this.userService.getUserMe(this.authService.getToken()).pipe(
        map(() => true),
        catchError(
          err => {
            console.log('AUTHGUARD can ERROR', err);
            this.authService.logout();
            return of(false);
          }
        )
      );
    }
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const hasUserData = this.authService.hasUserData();
    if (hasUserData) {
      return this.userService.getUserMe(this.authService.getToken()).pipe(
        map(() => true),
        catchError(
          err => {
            console.log('AUTHGUARD can ERROR', err);
            this.authService.logout();
            return of(false);
          }
        )
      );
    }
  }
}
