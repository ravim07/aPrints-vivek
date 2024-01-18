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
import { Member } from '_models';
import { Publication } from '_models/publication.model';
import { MemberService } from '_services';

@Injectable({ providedIn: UserDashboardModule })
export class MembersResolverService implements Resolve<Member[]> {
  constructor(private memberService: MemberService, private router: Router) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Member[]> {
    const publication = route.parent.data.publication;
    return this.getObservable(publication);
  }

  resolve2(pub: Publication) {
    return this.getObservable(pub);
  }

  getObservable(pub: Publication): Observable<Member[]> {
    return this.memberService.getMembers(pub.id).pipe(
      catchError(() => {
        return of(null);
      })
    );
  }
}
