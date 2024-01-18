import { Injectable } from '@angular/core';
import {
  Router, Resolve, RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from 'auth/auth.service';
import { Publication } from '_models/publication.model';
import { PublicationService } from '_services';

@Injectable()
export class PublicationsResolverService implements Resolve<Publication> {
  constructor(
    private publicationService: PublicationService,
    private authService: AuthService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {

    if (this.authService.hasToken()) {
      return this.publicationService.getPublications().pipe(
        catchError((err) => {
          return of([]);
        })
      );
    }

    return of([]);
  }
}
