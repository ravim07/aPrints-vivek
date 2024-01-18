import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from 'auth/auth.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserPublicationsService } from 'user-dashboard/shared/services';
import { Publication } from '_models/publication.model';
import { PublicationService } from '_services';
import { UserDashboardModule } from './user-dashboard.module';

@Injectable({ providedIn: UserDashboardModule })
export class UserDashboardGuard implements CanActivateChild {
  constructor(
    private authService: AuthService,
    private router: Router,
    private publicationService: PublicationService,
    private userPublicationsService: UserPublicationsService
  ) {}

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    this.userPublicationsService.setCurrentPublication(null);

    if (this.authService.isRole('admin')) {
      this.router.navigate(['/home']);
      return of(false);
    }

    const expectedRoles = route.data.expectedRoles;
    const pubId = route.paramMap.get('publicationId');
    if (pubId && expectedRoles) {
      return this.checkRole(pubId, expectedRoles);
    }

    return of(true);
  }

  checkRole(pubId: string, expectedRoles: string[]): Observable<boolean> {
    return this.publicationService.getPublication(pubId).pipe(
      map((publication: Publication) => {
        this.userPublicationsService.setCurrentPublication(publication);
        if (expectedRoles.indexOf('any') >= 0) {
          return true;
        } else if (expectedRoles.indexOf(publication.role) >= 0) {
          return true;
        }

        this.router.navigateByUrl('/dashboard');
        return false;
      }),
      catchError((err) => {
        this.router.navigateByUrl('/dashboard');
        return of(false);
      })
    );
  }
}
