import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { User } from '_models';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  registerUser(user: User): Observable<User> {
    let accessToken: string;
    let userId: string;
    return this.http
      .post<User>(this.apiBaseUrl + 'users/register', user, httpOptions)
      .pipe(
        mergeMap((data: any) => {
          data = new User().deserialize(data);
          accessToken = data.id;
          userId = data.userId;
          const httpOpt = {
            headers: new HttpHeaders({ Authorization: accessToken }),
          };
          return this.http.get<User>(this.apiBaseUrl + 'users/me', httpOpt);
        }),
        map((data: User) => {
          data = this.getObjUserMe(data);
          data.accessToken = accessToken;
          data.id = userId;
          data.email = user.email;
          return data;
        }),
        catchError(this.formatErrors)
      );
  }

  registerFastUser(user: User): Observable<User> {
    let accessToken: string;
    let userId: string;
    return this.http
      .post<User>(this.apiBaseUrl + 'users/registerFastUser', user, httpOptions)
      .pipe(
        mergeMap((data: any) => {
          data = new User().deserialize(data);
          accessToken = data.id;
          userId = data.userId;
          const httpOpt = {
            headers: new HttpHeaders({ Authorization: accessToken }),
          };
          return this.http.get<User>(this.apiBaseUrl + 'users/me', httpOpt);
        }),
        map((data: User) => {
          data = this.getObjUserMe(data);
          data.accessToken = accessToken;
          data.id = userId;
          data.email = user.email;
          return data;
        }),
        catchError(this.formatErrors)
      );
  }

  edit(user: User): Observable<User> {
    return this.http
      .post<User>(this.apiBaseUrl + 'users/edit', user, httpOptions)
      .pipe(catchError(this.formatErrors));
  }

  loginUser(user: User): Observable<User> {
    let accessToken: string;
    let userId: string;
    return this.http
      .post<User>(this.apiBaseUrl + 'users/login', user, httpOptions)
      .pipe(
        mergeMap((data: any) => {
          data = new User().deserialize(data);
          accessToken = data.id;
          userId = data.userId;
          const httpOpt = {
            headers: new HttpHeaders({ Authorization: accessToken }),
          };
          return this.http.get<User>(this.apiBaseUrl + 'users/me', httpOpt);
        }),
        map((data: User) => {
          data = this.getObjUserMe(data);
          data.id = userId;
          data.accessToken = accessToken;
          data.email = user.email;
          return data;
        }),
        catchError(this.formatErrors)
      );
  }

  updateUserRoles(token: string): Observable<User> {
    const httpOpt = {
      headers: new HttpHeaders({ Authorization: token }),
    };

    return this.http.get<User>(this.apiBaseUrl + 'users/me', httpOpt).pipe(
      map((data: User) => {
        data = this.getObjUserMe(data);
        let userData = localStorage.getItem('userData');
        userData = userData ? JSON.parse(userData) : {};
        userData['roles'] = data.roles;
        // console.log(data.roles);
        localStorage.setItem('userData', JSON.stringify(userData));
        return data;
      }),
      catchError(this.formatErrors)
    );
  }

  getUserMe(token: string): Observable<User> {
    const httpOpt = {
      headers: new HttpHeaders({ Authorization: token }),
    };

    return this.http.get<User>(this.apiBaseUrl + 'users/me', httpOpt).pipe(
      map((user: User) => {
        user = this.getObjUserMe(user);
        user.accessToken = token;
        return user;
      }),
      catchError(this.formatErrors)
    );
  }

  forgotPassword(email: string): Observable<any> {
    const data = { email: email };
    return this.http
      .post<any>(this.apiBaseUrl + 'users/reset', data)
      .pipe(catchError(this.formatErrors));
  }

  resetPassword(token: string, password: string): Observable<any> {
    const httpOpt = {
      headers: new HttpHeaders({ Authorization: token }),
    };
    const data = { newPassword: password };
    return this.http
      .post<any>(this.apiBaseUrl + 'users/reset-password', data, httpOpt)
      .pipe(catchError(this.formatErrors));
  }

  getObjUserMe(data: any): User {
    const ret = new User().deserialize(data);
    return ret;
  }

  formatErrors(error: any) {
    console.error('Error(Service): ', error);
    return throwError(error.error);
  }
}
