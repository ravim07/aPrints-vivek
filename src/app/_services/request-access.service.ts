import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AccessRequest } from '_models';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class RequestAccessService {
  constructor(private http: HttpClient, private apiService: ApiService) {}

  requestAccessAsContributor(publicationId: string): Observable<AccessRequest> {
    return this.http
      .post<any>(
        this.apiService.getApiUrl(
          'RequestAccesses/' + publicationId + '/asContributor'
        ),
        {}
      )
      .pipe(
        map((data) => new AccessRequest().deserialize(data.data)),
        catchError(this.apiService.formatErrors)
      );
  }

  requestAccessAsEditor(publicationId: string): Observable<AccessRequest> {
    return this.http
      .post<any>(
        this.apiService.getApiUrl(
          'RequestAccesses/' + publicationId + '/asEditor'
        ),
        {}
      )
      .pipe(
        map((data) => new AccessRequest().deserialize(data.data)),
        catchError(this.apiService.formatErrors)
      );
  }

  getPendingRequests(): Observable<AccessRequest[]> {
    return this.http
      .get<any>(this.apiService.getApiUrl('RequestAccesses/listContributors'))
      .pipe(
        map((reqs) =>
          reqs.data.map((req) => new AccessRequest().deserialize(req))
        ),
        catchError(this.apiService.formatErrors)
      );
  }

  getAllPendingRequests(): Observable<AccessRequest[]> {
    return this.http
      .get<any>(this.apiService.getApiUrl('RequestAccesses/listAll'))
      .pipe(
        map((reqs) =>
          reqs.data.map((req) => new AccessRequest().deserialize(req))
        ),
        catchError(this.apiService.formatErrors)
      );
  }

  approveRequest(requestId: string): Observable<AccessRequest> {
    return this.http
      .post<any>(
        this.apiService.getApiUrl('RequestAccesses/' + requestId + '/approve'),
        {}
      )
      .pipe(
        map((data) => new AccessRequest().deserialize(data.data)),
        catchError(this.apiService.formatErrors)
      );
  }

  denyRequest(requestId: string): Observable<AccessRequest> {
    return this.http
      .post<any>(
        this.apiService.getApiUrl('RequestAccesses/' + requestId + '/deny'),
        {}
      )
      .pipe(
        map((data) => new AccessRequest().deserialize(data.data)),
        catchError(this.apiService.formatErrors)
      );
  }

  getOwnRequests(userId: string): Observable<AccessRequest[]> {
    // filter[where][user]=${userId}
    // filter={"where": {"user":"${userId}"}}
    return this.http
      .get<any>(
        this.apiService.getApiUrl(
          `RequestAccesses?filter[include]=publication&filter[where][user]=${userId}`
        )
      )
      .pipe(
        map((reqs) => reqs.map((req) => new AccessRequest().deserialize(req))),
        catchError(this.apiService.formatErrors)
      );
  }
}
