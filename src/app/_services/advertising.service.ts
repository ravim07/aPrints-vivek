import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { AdvertisingSummaryItem, PageAdPricing } from '_models';
import { AdResource } from '_models/ad-resource.model';
import { AdvertisingSummary } from '_models/advertising-summary.model';
import { PageAdPayment } from '_models/page-ad-payment.model';


@Injectable({
  providedIn: 'root'
})
export class AdvertisingService {

  constructor(private http: HttpClient, private apiService: ApiService) {
  }

  batchEditPageAdPricing(pubId: string, data: any): Observable<{ batchResult: PageAdPricing[], deleteResult: PageAdPricing[] }> {
    return this.http.post<any>(this.apiService.getApiUrl(`Publications/${ pubId }/batchEditPageAdPricing`), data).pipe(
      // map(d => new PageAdPricing().deserialize(d.data)),
      map(data => {
        const batchResult = [], deleteResult = [];
        let pageAdObj;
        data.data.fullBatchResult.forEach(pageAd => {
          pageAdObj = new PageAdPricing().deserialize(pageAd);
          batchResult.push(pageAdObj);
        });
        data.data.deletedResult.forEach(pageAd => {
          pageAdObj = new PageAdPricing().deserialize(pageAd);
          deleteResult.push(pageAdObj);
        });
        return { batchResult, deleteResult };
      }),
      catchError(this.apiService.formatErrors)
    );
  }

  getListPageAdPricings(pubId: string): Observable<PageAdPricing[]> {
    return this.http.get<any>(this.apiService.getApiUrl(`Publications/${ pubId }/listPageAdPricing`)).pipe(
      map(data => data.data),
      catchError(this.apiService.formatErrors)
    );
  }

  getAdPricing(pubId: string, adPricing: string): Observable<PageAdPricing> {
    return this.http.get<any>(this.apiService.getApiUrl(`Publications/${ pubId }/getPageAdPricing/${ adPricing }`)).pipe(
      map(data => data = new PageAdPricing().deserialize(data.data)),
      catchError(this.apiService.formatErrors)
    );
  }

  getMyOwnAdResources(issueId: string): Observable<AdResource[]> {
    return this.http.get(this.apiService.getApiUrl(`AdResources/listOwnAdResources/${ issueId }`))
      .pipe(map((result: any) => {
        result.data = result.data.map(item => Object.assign(new AdResource(), item));
        return result;
      }));
  }

  createAdResource(pubId: string, adResource: AdResource) {
    return this.http.post(this.apiService.getApiUrl(`PublicationIssues/${ pubId }/adResources`), adResource)
      .pipe(map((result: any) => {
        return Object.assign(new AdResource(), result);
      }));
  }

  updateAdResource(adResourceId: string, adResource: AdResource) {
    return this.http.patch(this.apiService.getApiUrl(`AdResources/${ adResourceId }`), adResource)
      .pipe(map((result: any) => {
        return Object.assign(new AdResource(), result);
      }));
  }

  getAttachmentsFromAdResource(adResourceId) {
    return this.http.get(this.apiService.getApiUrl(`AdResources/${ adResourceId }/getAttachments`));
  }

  addAttachmentToAdResource(adResourceId: string, file: string | Blob) {
    const formData = new FormData();
    formData.append('file', file);

    const headers = new HttpHeaders({
      'uploadFile': 'use'
    });

    const request = new HttpRequest('POST',
      this.apiService.getApiUrl(`AdResources/${ adResourceId }/uploadAttachment`),
      formData, { reportProgress: false, headers });

    return this.http.request(request);
  }

  deleteAdResource(adResourceId: string) {
    return this.http.delete(this.apiService.getApiUrl(`AdResources/${ adResourceId }/erase`));
  }

  removeAttachmentFromAdResource(adResourceId, attahcmentId) {
    return this.http.delete(this.apiService.getApiUrl(`/AdResources/${ adResourceId }/removeAttachment/${ attahcmentId }`));
  }

  getTotalAdvertising(publicationId: string): Observable<AdvertisingSummary> {
    return this.http.get<any>(this.apiService.getApiUrl(`Publications/${ publicationId }/getTotalAdvertising`)).pipe(
      map(summary => summary = new AdvertisingSummary().deserialize(summary.data)),
      catchError(this.apiService.formatErrors)
    );
  }

  getAdPayments(publicationId: string): Observable<any> {
    return this.http.get<any>(this.apiService.getApiUrl(`Publications/${ publicationId }/listAdPayments`)).pipe(
      map(adPayments => {
        const data = {
          'adPayments': [],
          'summary': null
        };

        data.summary = new AdvertisingSummary().deserialize(adPayments.data.perGroup);
        const mapLevels = [];
        data.summary.perGroup.forEach((group: AdvertisingSummaryItem) => {
          console.log(group.adPricing, group.adPricing.id);
          mapLevels[group.adPricing.id] = group.adPricing;
        });
        console.log(adPayments.data.adPayments, mapLevels);
        adPayments.data.adPayments.forEach(adPayment => {
          const adPaymentObj = new PageAdPayment().deserialize(adPayment);
          adPaymentObj.pageAdPricingDetails = mapLevels[adPaymentObj.adPricingId];
          data.adPayments.push(adPaymentObj);
        });
        data.adPayments.reverse();
        return data;
      }),
      catchError(this.apiService.formatErrors)
    );
  }

  inviteAdvertisers(publicationId: string, emails: string[]): Observable<any> {
    const data = {
      'email': emails,
      'publicationId': publicationId
    };

    return this.http.post<any>(this.apiService.getApiUrl(`Invites/inviteAdvertisers`), data).pipe(
      catchError(this.apiService.formatErrors)
    );
  }
}
