import { Injectable } from '@angular/core';
import { AuthService } from 'auth/auth.service';
import { permission, permissionEnum, role } from '_models';
import { Publication } from '_models/publication.model';

@Injectable({
  providedIn: 'root',
})
export class PermissionsService {
  currentUser = this.authService.getCurrentUser();

  constructor(private authService: AuthService) {}

  init() {
    this.currentUser = this.authService.getCurrentUser();
  }

  getPermission(permissionString: permissionEnum, publication?: Publication) {
    return role.hasPermission(
      publication ? publication.role : this.currentUser.roles[0],
      permission[permissionString]
    );
  }
}
