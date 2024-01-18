import { Injectable } from '@angular/core';
import {
  Router, ActivatedRouteSnapshot, RouterStateSnapshot,
  CanActivate,
  CanActivateChild} from '@angular/router';

import { Observable, of } from 'rxjs';
import { catchError, map, take, concatAll } from 'rxjs/operators';

import { AuthService } from 'auth/auth.service';
import { PublicationService } from '_services';
import { UserPublicationsService } from 'user-dashboard/shared/services';
import { Publication } from '_models/publication.model';

@Injectable()
export class OnboardingGuard implements CanActivateChild {

  constructor(
    private authService: AuthService,
    private router: Router,
    private publicationService: PublicationService,
    private userPublicationsService: UserPublicationsService
  ) { }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    // console.log('ONBOARDING', route, state);
    this.userPublicationsService.setCurrentPublication(null);

    const expectedRoles = route.data.expectedRoles;
    const pubId = route.paramMap.get('publicationId');
    const checkIfLogged = route.data.checkIfLogged;
    if (checkIfLogged || expectedRoles) {
      return this.authService.isAuthenticated().pipe(
        take(1),
        map((isAuth: boolean) => {
          if (isAuth) {
            // console.log('Onboarding is loggedIn');
            if (pubId && expectedRoles) {
              // console.log('Onboarding is loggedIn WITH expectedRoles');
              return this.checkRole(pubId, expectedRoles, state);
            }
            // console.log('Onboarding is loggedIn with NO expectedRoles');
            return of(true);
          }
          // console.log('Onboarding is NOT loggedIn');
          this.router.navigateByUrl('/home');
          return of(false);
        })
      ).pipe(concatAll());
    }
    return of(true);
  }

  checkRole(pubId: string, expectedRoles: string[], state: RouterStateSnapshot): Observable<boolean> {
    return this.publicationService.getPublication(pubId).pipe(
      map((publication: Publication) => {
        this.userPublicationsService.setCurrentPublication(publication);
        if (expectedRoles.indexOf(publication.role) >= 0) {
          // console.log('Onboarding user has expected role');
          return true;
        }
        // console.log('Onboarding user DOESNT have expected role');
        this.router.navigateByUrl('/home');
        return false;
      }),
      catchError((err) => {
        // console.log('Onboarding expected role error');
        this.router.navigateByUrl('/home');
        return of(false);
      })
    );
  }

}
