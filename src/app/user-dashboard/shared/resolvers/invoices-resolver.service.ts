import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot, } from '@angular/router';
import { Observable } from 'rxjs';
import { UserDashboardModule } from 'user-dashboard/user-dashboard.module';
import { ContributionService } from '../services';
import { StoreService } from '../state';
import { AdResource } from '_models/ad-resource.model';
import { PublicationService } from '_services';
import { Invoice } from '_models';

@Injectable({providedIn: UserDashboardModule})
export class InvoicesResolverService implements Resolve<Invoice[]> {
  constructor(
    private contributionsService: ContributionService,
    private publicationService: PublicationService
  ) {
  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Invoice[]> {
    const publicationId = route.paramMap.get('publicationId');
    return this.publicationService.getInvoices(publicationId);
  }

}
