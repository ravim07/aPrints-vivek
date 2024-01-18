import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserDashboardModule } from 'user-dashboard/user-dashboard.module';
import { DonationSummary } from '_models/donation-summary.model';
import { FundraisingService } from '_services';

@Injectable({ providedIn: UserDashboardModule })
export class SponsorshipSummaryResolverService
  implements Resolve<DonationSummary> {
  constructor(
    private fundraisingService: FundraisingService,
    private router: Router
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<DonationSummary> {
    const publication = route.parent.data.publication;
    return this.getObservable(publication.id);
  }

  resolve2(pubId: string): Observable<DonationSummary> {
    return this.getObservable(pubId);
  }

  getObservable(pubId: string): Observable<DonationSummary> {
    return this.fundraisingService.getTotalDonations(pubId).pipe(
      catchError(() => {
        this.router.navigate([`/dashboard/publication/${pubId}`]);
        return of(null);
      })
    );
  }
}
