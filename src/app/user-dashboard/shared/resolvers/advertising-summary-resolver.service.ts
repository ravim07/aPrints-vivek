import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { UserDashboardModule } from 'user-dashboard/user-dashboard.module';
import { AdvertisingSummary } from '_models/advertising-summary.model';
import { AdvertisingService } from '_services';

@Injectable({ providedIn: UserDashboardModule })
export class AdvertisingSummaryResolverService
  implements Resolve<AdvertisingSummary> {
  constructor(private advertisingService: AdvertisingService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<AdvertisingSummary> {
    // console.log(route);
    const publicationId = route.parent.data.publication.id;
    return this.getObservable(publicationId);
  }

  resolve2(pubId: string): Observable<AdvertisingSummary> {
    return this.getObservable(pubId);
  }

  getObservable(pubId: string): Observable<AdvertisingSummary> {
    return this.advertisingService.getTotalAdvertising(pubId);
  }
}
