import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot,
         ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Publication } from '_models/publication.model';
import { FundraisingService } from '_services';

@Injectable()
export class SubscriptionTypeResolverService implements Resolve<Publication> {
  constructor(
    private router: Router,
    private fundraisingService: FundraisingService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const pubId = route.paramMap.get('publicationId');
    const subscriptionTypeId = route.paramMap.get('subscriptionTypeId');

    return this.fundraisingService.getSubscriptions(pubId).pipe(
      map(data => {

        let subscriptionType = null;
        data.summary.perType.forEach(subscriptionTypeData => {
          if (subscriptionTypeData.subscriptionType.id === subscriptionTypeId) {
            subscriptionType = subscriptionTypeData.subscriptionType;
          }
        });
        if (subscriptionType) {
          return subscriptionType;
        } else {
          this.router.navigateByUrl('/home');
          return of(null);
        }
      }),
      catchError(err => {
        console.log('Error', err);
        this.router.navigateByUrl('/home');
        return of(null);
      })
    );

  }
}
