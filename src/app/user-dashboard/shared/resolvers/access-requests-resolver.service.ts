import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { UserDashboardModule } from 'user-dashboard/user-dashboard.module';
import { PublicationListItem } from '_models';
import { StoreService } from '../state/store.service';

@Injectable({ providedIn: UserDashboardModule })
export class AccessRequestsResolverService
  implements Resolve<PublicationListItem[]> {
  constructor(private storeService: StoreService) {}

  resolve(): Observable<PublicationListItem[]> {
    return this.storeService.refreshAccessRequestList();
  }

  getObservable(): Observable<PublicationListItem[]> {
    return this.storeService.refreshAccessRequestList();
  }
}
