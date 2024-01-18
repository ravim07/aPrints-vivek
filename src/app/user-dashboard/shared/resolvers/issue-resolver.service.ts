import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { UserDashboardModule } from 'user-dashboard/user-dashboard.module';
import { Issue } from '_models/issue.model';
import { StoreService } from '../state';

@Injectable({ providedIn: UserDashboardModule })
export class IssueResolverService implements Resolve<Issue> {
  constructor(private storeService: StoreService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Issue> {
    const issueId = route.paramMap.get('issueId');
    return this.storeService.refreshIssue(issueId);
  }

  // resolve(
  //   route: ActivatedRouteSnapshot,
  //   state: RouterStateSnapshot
  // ): Observable<any> {
  //   const issueId = route.paramMap.get('issueId');

  //   return this.getObservable(issueId).pipe(
  //     tap((issue) => {
  //       this.storeService.resolverUpdateIssue(issue);
  //     })
  //   );
  // }

  getObservable(issueId: string) {
    return this.storeService.refreshIssue(issueId);
  }
}
