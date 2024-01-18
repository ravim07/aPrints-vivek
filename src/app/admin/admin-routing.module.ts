import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { role } from '_models';
import { AdminGuard } from './admin-guard.service';

import { AdminComponent } from './admin.component';
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';
import { AuthGuard } from 'auth/auth.guard';

const adminRoutes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        canActivateChild: [AuthGuard, AdminGuard],
        children: [
          {
            path: 'issue/:issueId',
            component: AdminDashboardComponent,
            data: {
              expectedRoles: [role.admin]
            }
          },
          {
            path: 'dashboard',
            component: AdminDashboardComponent,
            data: {
              expectedRoles: [role.admin]
            }
          },
          { path: '', redirectTo: '/admin/dashboard', pathMatch: 'full' },
          { path: '**', redirectTo: '/admin/dashboard', pathMatch: 'full' }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(adminRoutes)
  ],
  exports: [
    RouterModule
  ],
  providers: [
    AdminGuard
  ]
})
export class AdminRoutingModule { }
