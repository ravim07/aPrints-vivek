import { Component, ViewEncapsulation } from '@angular/core';
import { AuthService } from 'auth/auth.service';
import { User } from '_models';

@Component({
  selector: 'app-dash-header',
  templateUrl: './dash-header.component.html',
  styleUrls: ['./dash-header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DashHeaderComponent {
  currentUser: User;

  constructor(private authService: AuthService) {
    this.currentUser = this.authService.getCurrentUser();
  }
}
