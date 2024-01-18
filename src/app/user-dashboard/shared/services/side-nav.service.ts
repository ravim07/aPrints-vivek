import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { UserDashboardModule } from 'user-dashboard/user-dashboard.module';

@Injectable({ providedIn: UserDashboardModule })
export class SideNavService {
  public sidenavToggleSubject: Subject<any> = new Subject<any>();
  constructor() {}
  toggle() {
    return this.sidenavToggleSubject.next();
  }
  getToggleEvent(): Observable<any> {
    return this.sidenavToggleSubject.asObservable();
  }
}
