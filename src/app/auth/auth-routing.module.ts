import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NoAuthGuardService } from './no-auth-guard.service';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AutologinComponent } from './autologin/autologin.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AuthLogoutGuardService } from './auth-logout-guard.service';

const loginRoutes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    outlet: 'popup',
    canActivate: [NoAuthGuardService]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [NoAuthGuardService]
  },
  {
    path: 'autologin',
    component: AutologinComponent
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    canActivate: [NoAuthGuardService]
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    canActivate: [AuthLogoutGuardService]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(loginRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class AuthRoutingModule { }
