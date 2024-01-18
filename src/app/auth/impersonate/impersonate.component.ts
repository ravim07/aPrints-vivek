import { Component, OnInit, Input } from '@angular/core';
import { ImpersonateService, UserService } from '_services';
import { User, role } from '_models';
import { AuthService } from 'auth/auth.service';

@Component({
  selector: 'app-impersonate',
  templateUrl: './impersonate.component.html',
  styleUrls: ['./impersonate.component.scss']
})
export class ImpersonateComponent implements OnInit {

  _impersonateEmail: string;
  adminToken: string;

  @Input()
  set impersonateEmail(val: string) {
    if (val) {
      this._impersonateEmail = val;
    }
  }

  @Input()
  set publication(val: string) {
    if (val) {
      this.impersonateService.setData(val);
    }
  }

  @Input()
  set issue(val: string) {
    if (val) {
      this.impersonateService.setData(undefined, val);
    }
  }

  constructor(
    private impersonateService: ImpersonateService,
    private userService: UserService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.adminToken = this.authService.getToken(true); // console.log('token', this.adminToken);
  }

  async impersonateUser() {
    const user = new User();
    user.email = this._impersonateEmail;
    const isAdmin = await this.impersonateService.checkIfAdmin();

    if (isAdmin) {
      this.impersonateService.impersonatedUserToken(user)
      .subscribe(
        async (impersonatedUser: User) => {
          await this.impersonateService.switchAdminToImpersonatedUser(impersonatedUser);
        },
        (errorData: any) => {
          console.error('Error ImpersonateUser', errorData);
        }
      );
    }
  }

  switchBackToAdmin() {
    const adminToken = this.authService.getToken(true);
    this.authService.logout(false);
    this.userService.getUserMe(adminToken).subscribe(
      async (user: User) => {
        if (user.roles.indexOf(role.admin) >= 0) {
          await this.impersonateService.switchBackToAdmin(user);
        }
      },
      (errorData: any) => {
        console.error('Error switchToAdmin getUserMe', errorData);
      });
  }
}
