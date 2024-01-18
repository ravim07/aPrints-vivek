import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';


@Injectable({
  providedIn: 'root'
})
export class ContactService {

  constructor(private http: HttpClient, private apiService: ApiService) { }

  createContactForm(data: any): Observable<any> {
    return this.http.post<any>(this.apiService.getApiUrl('users/sendContactEmail'), data).pipe(
      catchError(this.apiService.formatErrors)
    );
  }

  createQuote(data: any): Observable<any> {
    return this.http.post<any>(this.apiService.getApiUrl('users/getQuote'), data).pipe(
      catchError(this.apiService.formatErrors)
    );
  }

  sendRequestSample(data: any): Observable<any> {
    return this.http.post<any>(this.apiService.getApiUrl('users/sendRequestSample'), data).pipe(
      catchError(this.apiService.formatErrors)
    );
  }

}
