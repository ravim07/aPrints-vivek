import { Component, ViewEncapsulation } from '@angular/core';
import { AuthService } from 'auth/auth.service';
import { User } from '_models/user.model';
import { MatDialog } from '@angular/material';
import { ProfileEditComponent } from '_shared/modals/profile-edit/profile-edit.component';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UserMenuComponent {
  currentUser: User;

  constructor(private authService: AuthService, private dialog: MatDialog) {
    this.currentUser = this.authService.getCurrentUser();
  }

  logout() {
    this.authService.logout();
  }

  popupProfileEdit() {
    this.dialog.open(ProfileEditComponent, {
      panelClass: ['flat-dialog', 'normal', 'height-500', 'width-700']
    }).afterClosed().subscribe(result => {
      if (result.updated) {
        this.updateUserData();
      }
    });
  }

  updateUserData() {
    /// this.userService.getUserMe()
    this.currentUser = this.authService.getCurrentUser(); // console.log(me);
    /*this.userService.getUserMe(me.accessToken).subscribe( data => {
      this.loading = false;
      this.currentUser = data;
      this.roles = this.currentUser.roles;
      this.noRoles = !this.roles.length; console.log(![].length, ![1].length);
      this.managingEditor = this.currentUser.roles.indexOf('managingEditor') > -1;
      this.editorialStaff = this.currentUser.roles.indexOf('editorialStaff') > -1;
      this.contributor = this.currentUser.roles.indexOf('contributor') > -1;
      this.subscriber = this.currentUser.roles.indexOf('subscriber') > -1;
      this.advertiser = this.currentUser.roles.indexOf('advertiser') > -1;
      this.initSidebar();
      // console.log(this.roles, this.managingEditor, this.editorialStaff, this.contributor, this.subscriber, this.advertiser);
    });*/
    return;
  }

}
