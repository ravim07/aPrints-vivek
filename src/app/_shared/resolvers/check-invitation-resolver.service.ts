import { Injectable } from '@angular/core';
import {
  Router, Resolve, RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { InvitationService } from '_services';

@Injectable()
export class CheckInvitationResolverService implements Resolve<any> {

  constructor(
    private router: Router,
    private invitationService: InvitationService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {

    if (!route.queryParams['token']) {
      this.router.navigate(['home']);
      return of(null);
    }

    return this.invitationService.findAndCheckIfValid(route.queryParams['token']).pipe(
      catchError(err => {
        console.log(err);
        return of(err);
      })
    );
  }
}
