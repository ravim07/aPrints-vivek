import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserDashboardModule } from 'user-dashboard/user-dashboard.module';
import { Invitation } from '_models';
import { InvitationService } from '_services';

@Injectable({ providedIn: UserDashboardModule })
export class PendingInvitationsResolverService
  implements Resolve<Invitation[]> {
  constructor(
    private invitationService: InvitationService,
    private router: Router
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Invitation[]> {
    const publication = route.parent.data.publication;
    return this.getObservable(publication.id);
  }

  resolve2(pubId: string): Observable<Invitation[]> {
    return this.getObservable(pubId);
  }

  getObservable(pubId: string): Observable<Invitation[]> {
    return this.invitationService.getPendingInvites(pubId).pipe(
      map((results) => results.filter((invite) => invite.daysSinceInvite < 35)),
      catchError(() => {
        // this.router.navigate([`/dashboard/publication/${pubId}`]);
        return of(null);
      })
    );
  }
}
