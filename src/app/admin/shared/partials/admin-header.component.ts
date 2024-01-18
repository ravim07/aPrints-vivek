import { Component } from '@angular/core';
import { AuthService } from 'auth/auth.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.scss']
})
export class AdminHeaderComponent {
  assetsUrl = environment.assetsUrl;

  constructor(
    private authService: AuthService
  ) { }

  logout() {
    this.authService.logout();
  }

}
