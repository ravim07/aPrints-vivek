import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot, } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PublicationService } from '_services';

@Injectable()
export class PublicationPreviewResolverService implements Resolve<any> {
  constructor(
    private router: Router,
    private publicationService: PublicationService
  ) {
  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> {
    const pubId = route.paramMap.get('publicationId');
    return this.publicationService.getPublicationPreview(pubId).pipe(
      catchError((err) => {
        console.log('Error', err);
        this.router.navigateByUrl('/home');
        return of(null);
      })
    );
  }
}
