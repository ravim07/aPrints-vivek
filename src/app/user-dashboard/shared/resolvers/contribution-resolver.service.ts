import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { UserDashboardModule } from 'user-dashboard/user-dashboard.module';
import { Contribution } from '_models/contribution.model';
import { StoreService } from '../state';

@Injectable({ providedIn: UserDashboardModule })
export class ContributionResolverService implements Resolve<Contribution> {
  constructor(private storeService: StoreService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Contribution> {
    const contributionId = route.paramMap.get('contributionId');
    return this.storeService.refreshArticle(contributionId);
    // if (contributionId === 'new') {
    //   return of(null);
    // } else {
    //   return this.contributionService.getContribution(contributionId).pipe(
    //     tap((article) => {
    //       this.storeService.resolverUpdateArticle(article);
    //     }),
    //     catchError(() => {
    //       this.router.navigate(['/dashboard']);
    //       return of(null);
    //     })
    //   );
    // }
  }
}
