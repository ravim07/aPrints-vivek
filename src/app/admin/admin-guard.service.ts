import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot,
         CanActivateChild } from '@angular/router';

import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AuthService } from 'auth/auth.service';
import { UserService } from '_services';
import { User, role } from '_models';

@Injectable()
export class AdminGuard implements CanActivateChild {

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) { }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.checkRole();
  }

  checkRole(): Observable<boolean> {
    return this.userService.getUserMe(this.authService.getToken()).pipe(
      map((user: User) => {
        if (user.roles.indexOf(role.admin) >= 0) {
          return true;
        } else {
          this.authService.logout();
          return false;
        }
      }),
      catchError((err) => {
        this.authService.logout();
        return of(false);
      })
    );
  }
}
