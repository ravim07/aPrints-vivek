import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable()
export class OnboardingResolverService implements Resolve<any> {
  constructor() {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): any {
    // console.log('TCL: OnboardingResolverService -> state', state);
    // console.log('TCL: OnboardingResolverService -> route', route);
    return route.data;
  }
}
