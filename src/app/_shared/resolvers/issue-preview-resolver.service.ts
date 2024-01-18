import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot, } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IssueService } from '_services';

@Injectable()
export class IssuePreviewResolverService implements Resolve<any> {
  constructor(
    private router: Router,
    private issueService: IssueService
  ) {
  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> {
    const issueId = route.paramMap.get('issueId');
    console.log(issueId, route.paramMap);
    return this.issueService.getIssue(issueId).pipe(
      catchError((err) => {
        console.log('Error', err);
        this.router.navigateByUrl('/home');
        return of(null);
      })
    );
  }
}
