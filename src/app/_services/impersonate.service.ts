import { Injectable } from '@angular/core';
import { User, role } from '_models';
import { Observable } from 'rxjs';
import { mergeMap, catchError, map } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserService } from './users.service';
import { AuthService } from 'auth/auth.service';
import { Router } from '@angular/router';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class ImpersonateService {
  private apiBaseUrl = environment.apiBaseUrl;
  private issueId: string;
  private pubId: string;

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
  ) { }

  async checkIfAdmin(token?: string) {
    return new Promise((resolve, reject) => {
      try {
        const adminToken = token || this.authService.getToken();
        this.userService.getUserMe(adminToken).subscribe(
          (user: User) => {
            if (user.roles.indexOf(role.admin) >= 0) {
              resolve(true);
            } else { resolve(false); }
          },
          (errorData: any) => {
            console.error('Error Impersonate CheckIfAdmin', errorData);
            reject(errorData);
          });
      } catch (err) {
        console.error('Error Impersonate CheckIfAdmin getUserMe', err);
        reject(err);
      }
    });
  }

  impersonatedUserToken(user: User): Observable<User> {
    let accessToken: string;
    let userId: string;
    const adminToken = this.authService.getToken(); console.log('adminToken', adminToken);
    this.authService.saveAdminToken(adminToken);
    return this.http.post<User>(this.apiBaseUrl + 'users/getImpersonateToken', user, httpOptions).pipe(
      mergeMap((data: any) => {
        data = new User().deserialize(data);
        accessToken = data.id;
        userId = data.userId;
        console.log('impersonate', accessToken);
        const httpOpt = {
          headers: new HttpHeaders({ 'Authorization': accessToken })
        };
        this.authService.logout(false, false);
        return this.http.get<User>(this.apiBaseUrl + 'users/me', httpOpt);
      }),
      map((data: User) => {
        console.log('impersonatedUser data', data);
        data = this.userService.getObjUserMe(data);
        data.id = userId;
        data.accessToken = accessToken;
        data.email = user.email;
        return data;
      }),
      catchError(this.userService.formatErrors)
    );
  }

  async switchAdminToImpersonatedUser(impersonatedUser: User) {
    this.authService.logout(false, false);
    console.log(impersonatedUser);
    this.issueId = this.issueId;
    await this.authService.login(impersonatedUser); console.log('route:', this.pubId, this.issueId);
    this.router.navigateByUrl(`/dashboard/publication/${this.pubId}/issue/${this.issueId}`);
  }

  async switchBackToAdmin (user: User) {
    this.authService.login(user); console.log('route:', this.issueId);
    this.router.navigateByUrl(`/admin/issue/${this.issueId}`);
  }

  setData(...args: any[]) {
    if (args[1]) {
      this.issueId = args[1];
    }
    if (args[0]) {
      this.pubId = args[0];
    }
  }
}
