import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { Element as StripeElement, StripeService } from 'ngx-stripe';
import { untilDestroyed } from 'ngx-take-until-destroy';


@Injectable({ providedIn: 'root' })
export class PaymentService implements OnDestroy {

  constructor(private http: HttpClient, private apiService: ApiService,
              private stripeService: StripeService) {
  }

  initCard(card): Promise<StripeElement> {
    return new Promise(resolve => {
      const fonts = [{ cssSrc: 'https://fonts.googleapis.com/css?family=Montserrat:300,400,600,700' }];
      this.stripeService.elements({ fonts: fonts })
        .pipe(untilDestroyed(this)).subscribe(elements => {
        // Only mount the element the first time
        if (!card) {
          const stripeCard = elements.create('card', {
            hidePostalCode: true,
            style: {
              base: {
                iconColor: '#666EE8',
                color: '#31325F',
                letterSpacing: 'normal',
                fontWeight: 400,
                fontFamily: '"Montserrat"',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': {
                  color: '#CFD7E0'
                }
              }
            }
          });
          stripeCard.mount('#card-element');
          resolve(stripeCard);
        }
      });
    });
  }

  addDonation(publicationId: string, data: any): Observable<any> {
    return this.http.post<any>(this.apiService.getApiUrl(`Publications/${ publicationId }/addDonation`), data).pipe(
      catchError(this.apiService.formatErrors)
    );
  }

  addSubscription(publicationId: string, data: any): Observable<any> {
    return this.http.post<any>(this.apiService.getApiUrl(`Publications/${ publicationId }/addSubscription`), data).pipe(
      catchError(this.apiService.formatErrors)
    );
  }

  addPaymentForAd(publicationId: string, data: any): Observable<any> {
    return this.http.post<any>(this.apiService.getApiUrl(`Publications/${ publicationId }/addPaymentForAd`), data).pipe(
      catchError(this.apiService.formatErrors)
    );
  }

  createCardToken(properties) {
    return this.stripeService
      .createToken(properties.card, {
        name: properties.firstName + ' ' + properties.lastName,
        address_line1: properties.address1,
        address_line2: properties.address2,
        address_city: properties.city,
        address_state: properties.state,
        address_zip: properties.zip,
        address_country: 'US',
        currency: 'usd'
      });
  }

  createBankAccountToken(properties) {
    return this.stripeService
      .createToken('bank_account',
        {
          country: 'US',
          currency: 'usd',
          routing_number: properties.routingNumber,
          account_number: properties.accountNumber,
          account_holder_name: properties.firstName + ' ' + properties.lastName,
          account_holder_type: properties.accountHolderType,
        });
  }

  createPayout(publicationId: string, data: any) {
    return this.http
      .post(this.apiService.getApiUrl(`Publications/${ publicationId }/createPayout`), data)
      .pipe(
        catchError(this.apiService.formatErrors)
      );
  }

  ngOnDestroy() {
  }
}
