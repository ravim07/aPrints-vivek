import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CustomerAccountService {

  constructor(private http: HttpClient, private apiService: ApiService) {
  }

  attachCustomerAccount(publicationId: string, data: any): Observable<any> {
    return this.http.post<any>(this.apiService.getApiUrl(`Publications/${ publicationId }/attachCustomerAccount`), data).pipe(
      catchError(this.apiService.formatErrors)
    );
  }

  attachCustomAccount(publicationId: string, data: any): Observable<any> {
    return this.http.post<any>(this.apiService.getApiUrl(`Publications/${ publicationId }/attachCustomAccount`), data).pipe(
      catchError(this.apiService.formatErrors)
    );
  }

  removeCustomerAccount(publicationId: string, data: any): Observable<any> {
    return this.http.post<any>(this.apiService.getApiUrl(`Publications/${ publicationId }/removeCustomerAccount`), data).pipe(
      catchError(this.apiService.formatErrors)
    );
  }

  verifyBankAccount(publicationId: string, data: any): Observable<any> {
    return this.http.post<any>(this.apiService.getApiUrl(`Publications/${ publicationId }/verifyBankAccount`), data).pipe(
      catchError(this.apiService.formatErrors)
    );
  }

  createACHCharge(publicationId: string, data: any): Observable<any> {
    return this.http.post<any>(this.apiService.getApiUrl(`Publications/${ publicationId }/createACHCharge`), data).pipe(
      catchError(this.apiService.formatErrors)
    );
  }

  checkAvailableFunds(publicationId: string): Observable<any> {
    return this.http.get<any>(this.apiService.getApiUrl(`Publications/${ publicationId }/checkAvailableFunds`)).pipe(
      catchError(this.apiService.formatErrors)
    );
  }

}
