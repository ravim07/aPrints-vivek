import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AdvertisingService } from '_services';
import { UserPublicationsService } from 'user-dashboard/shared/services';
import { PageAdPricing } from '_models';

@Injectable()
export class OnboardingPageAdPricingResolverService implements Resolve<PageAdPricing> {
  constructor(
    private advertisingService: AdvertisingService,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const pubId = route.paramMap.get('publicationId');
    const adPricingId = route.paramMap.get('pageAdPricingId');

    return this.advertisingService.getAdPricing(pubId,adPricingId).pipe(
      catchError(() => {
        // this.router.navigate(['/onboarding']);
        return of(null);
      })
    );

  }
}
