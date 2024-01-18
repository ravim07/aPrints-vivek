import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot,
         ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from 'auth/auth.service';
import { UserService } from '_services';

@Injectable()
export class CurrentUserResolverService implements Resolve<any> {

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {

    if (this.authService.hasToken()) {
      return this.userService.getUserMe(this.authService.getToken()).pipe(
        catchError(err => {
          this.authService.logout(false);
          return of(null);
        })
      );
    }

    return of(null);
  }
}
