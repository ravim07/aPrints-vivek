import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { RememberPublicationService } from 'app/onboarding/services';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '_models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isAuthenticatedSubject: BehaviorSubject<boolean> = new BehaviorSubject<
    boolean
  >(this.hasToken());

  constructor(
    private router: Router,
    private rememberPublication: RememberPublicationService
  ) {}

  login(user: User): void {
    if (user.accessToken) {
      this.saveToken(user.accessToken);
    }
    this.saveUserData(user);
    this.isAuthenticatedSubject.next(true);
    this.rememberPublication.updatePublication(null);
  }

  logout(redirect = true, eraseAdmin = true): void {
    this.destroyToken();
    if (eraseAdmin) {
      this.destroyToken(true);
    }
    this.destroyUserData();
    this.isAuthenticatedSubject.next(false);
    if (redirect) {
      this.router.navigate(['/home', { outlets: { popup: 'null' } }]);
    }
  }

  isRole(role: string): boolean {
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.roles) {
      return currentUser.roles.indexOf(role) !== -1;
    }
    return false;
  }

  getToken(admin = false): string {
    if (!admin) {
      return window.localStorage['aToken'];
    } else {
      return window.localStorage['adminToken'];
    }
  }

  hasToken(): boolean {
    return !!localStorage.getItem('aToken');
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  setCurrentUser(user: User): boolean {
    if (user.roles) {
      if (this.checkRoles(user.roles)) {
        this.saveUserData(user);
        return true;
      }
      return false;
    }
    return false;
  }

  setRedirectUrl(redirectUrl: string): void {
    window.localStorage['redirect-url'] = redirectUrl;
  }

  getRedirectUrl(): string | null {
    if (!!localStorage.getItem('redirectUrl')) {
      return localStorage.getItem('redirectUrl');
    }
    return null;
  }

  destroyRedirectUrl(): void {
    window.localStorage.removeItem('redirectUrl');
  }

  setInvitationToken(invitationToken: string): void {
    window.localStorage['invitationToken'] = invitationToken;
  }

  getInvitationToken(): string | null {
    if (!!localStorage.getItem('invitationToken')) {
      return localStorage.getItem('invitationToken');
    }
    return null;
  }

  acceptInvitation() {
    this.router.navigateByUrl(
      '/join-publication?token=' + this.getInvitationToken()
    );
    this.destroyInvitationToken();
  }

  destroyInvitationToken(): void {
    window.localStorage.removeItem('invitationToken');
  }

  setRequestAccessPublication(invitationToken: string): void {
    window.localStorage['requestAccess'] = invitationToken;
  }

  getRequestAccessPublication(): string | null {
    if (!!localStorage.getItem('requestAccess')) {
      return localStorage.getItem('requestAccess');
    }
    return null;
  }

  destroyRequestAccessPublication(): void {
    window.localStorage.removeItem('requestAccess');
  }

  private checkRoles(roles): boolean {
    const currentUser = this.getCurrentUser();
    let ret = true;
    roles.forEach((role) => {
      if (currentUser.roles.indexOf(role) < 0) {
        ret = false;
      }
    });
    return ret;
  }

  saveAdminToken(token: string): void {
    this.saveToken(token, true);
  }

  private saveToken(token: string, admin = false): void {
    if (!admin) {
      window.localStorage['aToken'] = token;
    } else {
      window.localStorage['adminToken'] = token;
    }
  }

  private destroyToken(admin = false): void {
    if (!admin) {
      window.localStorage.removeItem('aToken');
    } else {
      window.localStorage.removeItem('adminToken');
    }
  }

  private saveUserData(user: User) {
    window.localStorage['userData'] = JSON.stringify(user);
  }

  getCurrentUser(): User {
    if (this.hasUserData()) {
      return JSON.parse(window.localStorage['userData']);
    }
    return null;
  }

  destroyUserData(): void {
    window.localStorage.removeItem('userData');
  }

  hasUserData(): boolean {
    return !!localStorage.getItem('userData');
  }
}
