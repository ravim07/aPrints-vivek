import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserDashboardModule } from 'user-dashboard/user-dashboard.module';
import { AdResource } from '_models/ad-resource.model';
import { AdvertisingService } from '_services';
import { StoreService } from 'user-dashboard/shared/state';

@Injectable({providedIn: UserDashboardModule})
export class AdvertisementResolverService
  implements Resolve<AdResource> {
  constructor(private advertisingService: AdvertisingService,
              private storeService: StoreService,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot): Observable<AdResource> {
    const advertisementId = route.paramMap.get('advertisementId');
    return this.storeService.refreshAdvertisement(advertisementId);
  }
/*
  getObservable(issueId: string): Observable<AdResource[]> {
    return this.advertisingService.getMyOwnAdResources(issueId).pipe(
      map((response: any) => {
        return response.data;
      })
    );
  }*/
}
