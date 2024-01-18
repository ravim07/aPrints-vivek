import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot,
         ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Publication } from '_models/publication.model';
import { FundraisingService } from '_services';

@Injectable()
export class DonationLevelResolverService implements Resolve<Publication> {
  constructor(
    private router: Router,
    private fundraisingService: FundraisingService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const pubId = route.paramMap.get('publicationId');
    const levelId = route.paramMap.get('levelId');

    return this.fundraisingService.getDonations(pubId).pipe(
      map(data => {

        let level = null;
        data.summary.perLevel.forEach(levelData => {
          if (levelData.donationLevel.id === levelId) {
            level = levelData.donationLevel;
          }
        });
        if (level) {
          return level;
        } else {
          this.router.navigateByUrl('/home');
          return of(null);
        }
      }),
      catchError(err => {
        console.log('Error', err);
        this.router.navigateByUrl('/home');
        return of(null);
      })
    );

  }
}
