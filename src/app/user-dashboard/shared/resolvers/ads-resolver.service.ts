import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot, } from '@angular/router';
import { Observable } from 'rxjs';
import { UserDashboardModule } from 'user-dashboard/user-dashboard.module';
import { ContributionService } from '../services';
import { StoreService } from '../state';
import { AdResource } from '_models/ad-resource.model';

@Injectable({providedIn: UserDashboardModule})
export class AdsResolverService implements Resolve<AdResource[]> {
  constructor(
    private contributionsService: ContributionService,
    private storeService: StoreService
  ) {
  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<AdResource[]> {
    const issueId = route.paramMap.get('issueId');
    return this.storeService.refreshAdvertisementList(issueId);
  }


  getObservable(issueId: string) {
    return this.storeService.refreshSubmissionList(issueId);
  }
}
