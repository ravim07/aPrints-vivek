import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserDashboardModule } from 'user-dashboard/user-dashboard.module';
import { ContributionFeedback } from '_models';
import { ContributionEntry } from '_models/contribution-entry.model';
import { Contribution } from '_models/contribution.model';
import { ApiService } from '_services/api.service';
import { AdResource } from '_models/ad-resource.model';
import { AdvertisementEntry } from '_models/advertisement-entry.model';

@Injectable({ providedIn: UserDashboardModule })
export class AdvertisementService {
  constructor(private http: HttpClient, private apiService: ApiService) {}

  getAdvertisement(advertisementId: string): Observable<AdResource> {
    const url = this.apiService.getApiUrl('Advertisements/' + advertisementId);
    return this.http.get<any>(url).pipe(
      map((issue) => (issue = new AdResource().deserialize(issue))),
      catchError(this.apiService.formatErrors)
    );
  }

  getMyOwnAdvertisements(issueId: string): Observable<AdResource[]> {
    return this.http
      .get(
        this.apiService.getApiUrl(
          `Advertisements/listOwnAdvertisements/${issueId}`
        )
      )
      .pipe(
        map((result: any) => {
          result = result.data.map((item) =>
            Object.assign(new AdResource(), item)
          );
          return result;
        })
      );
  }

  create(pubId: string, advertisement: AdResource): Observable<AdResource> {
    return this.http
      .post(
        this.apiService.getApiUrl(`PublicationIssues/${pubId}/advertisements`),
        advertisement
      )
      .pipe(
        map((result: any) => {
          return Object.assign(new AdResource(), result);
        })
      );
  }

  update(
    advertisementId: string,
    advertisement: AdResource
  ): Observable<AdResource> {
    return this.http
      .patch(
        this.apiService.getApiUrl(`Advertisements/${advertisementId}`),
        advertisement
      )
      .pipe(
        map((result: any) => {
          return Object.assign(new AdResource(), result);
        })
      );
  }

  addEntry(
    advertisementId: string,
    entry: AdvertisementEntry
  ): Observable<AdvertisementEntry> {
    return this.http
      .post(
        this.apiService.getApiUrl(`Advertisements/${advertisementId}/addEntry`),
        entry
      )
      .pipe(
        map((result: any) => {
          return Object.assign(new AdvertisementEntry(), result.data);
        })
      );
  }

  updateEntry(
    advertisementId: string,
    entry: AdvertisementEntry
  ): Observable<AdvertisementEntry> {
    return this.http
      .post(
        this.apiService.getApiUrl(
          `Advertisements/${advertisementId}/updateEntry/${entry.id}`
        ),
        entry
      )
      .pipe(
        map((result: any) => {
          return Object.assign(new AdvertisementEntry(), result.data);
        })
      );
  }

  addFeedback(
    advertisementId: string,
    entryId: string,
    feedback: ContributionFeedback
  ) {
    return this.http
      .post(
        this.apiService.getApiUrl(
          `Advertisements/${advertisementId}/entries/${entryId}/addFeedback`
        ),
        feedback
      )
      .pipe(
        map((result: any) => {
          return Object.assign(new ContributionFeedback(), result.data);
        })
      );
  }

  getAttachments(advertisementId: string, entryId: string) {
    return this.http.get(
      this.apiService.getApiUrl(
        `Advertisements/${advertisementId}/entries/${entryId}/getAttachments`
      )
    );
  }

  addAttachment(advertisementId: string, entryId: string, file: string | Blob) {
    const formData = new FormData();
    formData.append('file', file);

    const headers = new HttpHeaders({
      uploadFile: 'use',
    });

    const request = new HttpRequest(
      'POST',
      this.apiService.getApiUrl(
        `UploadedFiles/uploadS3OnlyFile`
      ),
      formData,
      { reportProgress: false, headers }
    );

    return this.http.request(request);
  }

  delete(advertisementId: string) {
    return this.http.delete(
      this.apiService.getApiUrl(`Advertisements/${advertisementId}/erase`)
    );
  }

  removeAttachment(advertisementId: string, entryId: string, fileId: string) {
    return this.http.delete(
      this.apiService.getApiUrl(
        `/Advertisements/${advertisementId}/entries/${entryId}/removeAttachment/${fileId}`
      )
    );
  }
}
