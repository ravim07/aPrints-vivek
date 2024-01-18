import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, tap, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Observable, EMPTY } from 'rxjs';

import { ApiService } from './api.service';

export interface PricingServiceBody {
  insidePages: number;
  numberOfCopies: number;
  color: boolean;
  zip?: string;
}

@Injectable({ providedIn: 'root' })
export class PriceCalculatorService {

  constructor(private http: HttpClient, private apiService: ApiService) { }

  getPricing(data: any): Observable<any> {
    return this.http.post<any>(this.apiService.getApiUrl('Pricings/getPricing'), data).pipe(
      tap(
        res => console.log('Got price', res),
        error => console.error(error)),
      catchError(this.apiService.formatErrors)
    );
  }

  askPricing(body: Observable<PricingServiceBody>): Observable<any> {
    return body.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      switchMap(r => {
        if (r.numberOfCopies > 99) {
          return this.getPricing(r);
        }
        return EMPTY;
      }));
  }
}
