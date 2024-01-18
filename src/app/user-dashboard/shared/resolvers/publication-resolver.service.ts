import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { UserDashboardModule } from 'user-dashboard/user-dashboard.module';
import { Publication } from '_models/publication.model';
import { StoreService } from '../state';

@Injectable({ providedIn: UserDashboardModule })
export class PublicationResolverService implements Resolve<Publication> {
  constructor(private storeService: StoreService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Publication> {
    const pubId = route.paramMap.get('publicationId');
    return this.storeService.refreshPublication(pubId);
  }

  // resolve(route: ActivatedRouteSnapshot): Observable<Publication> {
  //   const pubId = route.paramMap.get('publicationId');
  //   return this.getObservable(pubId).pipe(
  //     tap((publication: Publication) => {
  //       this.storeService.resolverUpdatePublication(publication);
  //       this.storeService.resolverUpdateIssueList(
  //         publication.publicationIssues
  //       );
  //     })
  //   );
  // }

  resolve2(pubId: string): Observable<Publication> {
    return this.storeService.refreshPublication(pubId);
  }

  // getObservable(pubId: string) {
  //   return this.publicationService.getPublication(pubId).pipe(
  //     catchError(() => {
  //       this.router.navigate(['/dashboard']);
  //       return of(null);
  //     })
  //   );
  // }
}
