import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { UserDashboardModule } from 'user-dashboard/user-dashboard.module';
import { Contribution } from '_models/contribution.model';
import { ContributionService } from '../services';
import { StoreService } from '../state';

@Injectable({ providedIn: UserDashboardModule })
export class SubmissionsResolverService implements Resolve<Contribution[]> {
  constructor(
    private contributionsService: ContributionService,
    private storeService: StoreService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Contribution[]> {
    const issueId = route.paramMap.get('issueId');
    return this.storeService.refreshSubmissionList(issueId);
  }

  // resolve(
  //   route: ActivatedRouteSnapshot,
  //   state: RouterStateSnapshot
  // ): Observable<any> {
  //   const issueId = route.paramMap.get('issueId');

  //   return this.getObservable(issueId);
  // }

  getObservable(issueId: string) {
    return this.storeService.refreshSubmissionList(issueId);
  }
}
