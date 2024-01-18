import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import { ApiService } from './api.service';
import { DonationLevel, DonationSummaryItem, SubscriptionType, SubscriptionSummaryItem } from '_models';
import { Donation } from '_models/donation.model';
import { DonationSummary } from '_models/donation-summary.model';
import { SubscriptionSummary } from '_models/subscription-summary.model';
import { Subscription } from '_models/subscription.model';


@Injectable({
  providedIn: 'root'
})
export class FundraisingService {

  constructor(private http: HttpClient, private apiService: ApiService) { }

  createDonationlevel(publicationId: string, data: any): Observable<DonationLevel> {
    return this.http.post<any>(this.apiService.getApiUrl(`Publications/${publicationId}/newDonationLevel`), data).pipe(
      map(d => new DonationLevel().deserialize(d.data)),
      catchError(this.apiService.formatErrors)
    );
  }

  editDonationLevel(publicationId: string, levelId: string, data: any): Observable<DonationLevel> {
    return this.http.patch<any>(this.apiService.getApiUrl(`Publications/${publicationId}/editDonationLevel/${levelId}`), data)
      .pipe(
        map(level => level = new DonationLevel().deserialize(level)),
        catchError(this.apiService.formatErrors)
      );
  }

  deleteDonationLevel(publicationId: string, levelId: string) {
    return this.http.delete<any>(this.apiService.getApiUrl(`Publications/${publicationId}/deleteDonationLevel/${levelId}`)).pipe(
      catchError(this.apiService.formatErrors)
    );
  }

  getListDonationsLevels(publicationId: string): Observable<DonationLevel[]> {
    return this.http.get<any>(this.apiService.getApiUrl(`Publications/${publicationId}/listDonationLevels`)).pipe(
      map(levels => levels.data.map(level => new DonationLevel().deserialize(level))),
      catchError(this.apiService.formatErrors)
    );
  }

  getTotalDonations(publicationId: string): Observable<DonationSummary> {
    return this.http.get<any>(this.apiService.getApiUrl(`Publications/${publicationId}/getTotalDonations`)).pipe(
      map(summary => summary = new DonationSummary().deserialize(summary.data)),
      catchError(this.apiService.formatErrors)
    );
  }

  getDonations(publicationId: string): Observable<any> {
    return this.http.get<any>(this.apiService.getApiUrl(`Publications/${publicationId}/listDonations`)).pipe(
      map(donations => {
        const data = {
          'donations': [],
          'summary': null
        };

        data.summary = new DonationSummary().deserialize(donations.data.perLvl);
        const mapLevels = [];
        data.summary.perLevel.forEach((level: DonationSummaryItem) => {
          mapLevels[level.donationLevel.id] = level.donationLevel;
        });

        donations.data.donations.forEach(donation => {
          const donationObj = new Donation().deserialize(donation);
          donationObj.donationLevelDetails = mapLevels[donationObj.donationLevel];
          data.donations.push(donationObj);
        });
        data.donations.reverse();
        return data;
      }),
      catchError(this.apiService.formatErrors)
    );
  }

  inviteSponsors(publicationId: string, emails: string[]): Observable<any> {
    const data = {
      'email': emails,
      'inviteTargetId': publicationId
    };

    return this.http.post<any>(this.apiService.getApiUrl(`Invites/inviteSponsors`), data).pipe(
      catchError(this.apiService.formatErrors)
    );
  }

  listSponsorInvitations(publicationId: string, filter: string): Observable<any> {
    return this.http.get<any>(this.apiService.getApiUrl(`Publications/${publicationId}/listSponsorInvitations?${filter}`)).pipe(
      map(data => data.data),
      catchError(this.apiService.formatErrors)
    );
  }

  createSubscriptionType(publicationId: string, data: any): Observable<SubscriptionType> {
    return this.http.post<any>(this.apiService.getApiUrl(`Publications/${publicationId}/newSubscriptionType`), data).pipe(
      map(d => new SubscriptionType().deserialize(d.data)),
      catchError(this.apiService.formatErrors)
    );
  }

  editSubscriptionType(publicationId: string, subsType: string, data: any): Observable<SubscriptionType> {
    return this.http.patch<any>(this.apiService.getApiUrl(`Publications/${publicationId}/editSubscriptionType/${subsType}`), data)
      .pipe(
        map(type => type = new SubscriptionType().deserialize(type)),
        catchError(this.apiService.formatErrors)
      );
  }

  deleteSubscriptionType(publicationId: string, subsType: string) {
    return this.http.delete<any>(this.apiService.getApiUrl(`Publications/${publicationId}/deleteSubscriptionType/${subsType}`)).pipe(
      catchError(this.apiService.formatErrors)
    );
  }

  getListSubscriptionTypes(publicationId: string): Observable<SubscriptionType[]> {
    return this.http.get<any>(this.apiService.getApiUrl(`Publications/${publicationId}/listSubscriptionTypes`)).pipe(
      map(types => types.data.map(type => new SubscriptionType().deserialize(type))),
      catchError(this.apiService.formatErrors)
    );
  }

  getTotalSubscriptions(publicationId: string): Observable<SubscriptionSummary> {
    return this.http.get<any>(this.apiService.getApiUrl(`Publications/${publicationId}/getTotalSubscriptions`)).pipe(
      map(summary => summary = new SubscriptionSummary().deserialize(summary.data)),
      catchError(this.apiService.formatErrors)
    );
  }

  getSubscriptions(publicationId: string): Observable<any> {
    return this.http.get<any>(this.apiService.getApiUrl(`Publications/${publicationId}/listSubscriptions`)).pipe(
      map(subscriptions => {
        const data = {
          'subscriptions': [],
          'summary': null
        };

        data.summary = new SubscriptionSummary().deserialize(subscriptions.data.perType);
        const mapSubcriptionTypes = [];
        data.summary.perType.forEach((type: SubscriptionSummaryItem) => {
          mapSubcriptionTypes[type.subscriptionType.id] = type.subscriptionType;
        });

        subscriptions.data.subscriptions.forEach(subscription => {
          const subscriptionObj = new Subscription().deserialize(subscription);
          subscriptionObj.subscriptionTypeDetails = mapSubcriptionTypes[subscriptionObj.subscriptionType];
          data.subscriptions.push(subscriptionObj);
        });
        data.subscriptions.reverse();
        return data;
      }),
      catchError(this.apiService.formatErrors)
    );
  }

  inviteSubscribers(publicationId: string, emails: string[]): Observable<any> {
    const data = {
      'email': emails,
      'publicationId': publicationId
    };

    return this.http.post<any>(this.apiService.getApiUrl(`Invites/inviteSubscribers`), data).pipe(
      catchError(this.apiService.formatErrors)
    );
  }

  importSelfManagedSubscriptions(publicationId: string, data: any): Observable<any> {
    return this.http.post<any>(this.apiService.getApiUrl(`Publications/${publicationId}/importSelfManagedSubscriptions`), data).pipe(
      catchError(this.apiService.formatErrors)
    );
  }
}
