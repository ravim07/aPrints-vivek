import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router,
         RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Issue } from '_models/issue.model';
import { IssueService } from '_services';

@Injectable()
export class OnboardingIssueResolverService implements Resolve<Issue> {

  constructor(
    private issueService: IssueService,
    private router: Router
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const issueId = route.paramMap.get('issueId');

    return this.issueService.getIssue(issueId).pipe(
      catchError(() => {
        // this.router.navigate(['/dashboard']);
        return of(null);
      })
    );

  }
}
