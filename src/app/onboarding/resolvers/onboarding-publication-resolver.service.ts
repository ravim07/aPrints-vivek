import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Publication } from '_models/publication.model';
import { PublicationService } from '_services';
import { UserPublicationsService } from 'user-dashboard/shared/services';

@Injectable()
export class OnboardingPublicationResolverService implements Resolve<Publication> {
  constructor(
    private publicationService: PublicationService,
    private router: Router,
    private userPublicationsService: UserPublicationsService
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const pubId = route.paramMap.get('publicationId');

    return this.publicationService.getPublication(pubId).pipe(
      catchError(() => {
        // this.router.navigate(['/onboarding']);
        return of(null);
      })
    );

  }
}
