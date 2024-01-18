import { Injectable } from '@angular/core';
import { UserDashboardModule } from 'user-dashboard/user-dashboard.module';

@Injectable({ providedIn: UserDashboardModule })
export class ReloadService {
  constructor() {}
}
