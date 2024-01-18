import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserDashboardModule } from 'user-dashboard/user-dashboard.module';
import { ContributionFeedback } from '_models';
import { ContributionEntry } from '_models/contribution-entry.model';
import { Contribution } from '_models/contribution.model';
import { ApiService } from '_services/api.service';

@Injectable({ providedIn: UserDashboardModule })
export class ContributionService {
  constructor(private http: HttpClient, private apiService: ApiService) {}

  getContribution(contributionId: string): Observable<Contribution> {
    const url = this.apiService.getApiUrl('Contributions/' + contributionId);
    return this.http.get<any>(url).pipe(
      map((issue) => (issue = new Contribution().deserialize(issue))),
      catchError(this.apiService.formatErrors)
    );
  }

  getMyOwnContributions(issueId: string): Observable<Contribution[]> {
    return this.http
      .get(
        this.apiService.getApiUrl(
          `Contributions/listOwnContributions/${issueId}`
        )
      )
      .pipe(
        map((result: any) => {
          result = result.data.map((item) =>
            Object.assign(new Contribution(), item)
          );
          return result;
        })
      );
  }

  create(pubId: string, contribution: Contribution): Observable<Contribution> {
    return this.http
      .post(
        this.apiService.getApiUrl(`PublicationIssues/${pubId}/contributions`),
        contribution
      )
      .pipe(
        map((result: any) => {
          return Object.assign(new Contribution(), result);
        })
      );
  }

  update(
    contributionId: string,
    contribution: Contribution
  ): Observable<Contribution> {
    return this.http
      .patch(
        this.apiService.getApiUrl(`Contributions/${contributionId}`),
        contribution
      )
      .pipe(
        map((result: any) => {
          return Object.assign(new Contribution(), result);
        })
      );
  }

  addEntry(
    contributionId: string,
    entry: ContributionEntry
  ): Observable<ContributionEntry> {
    return this.http
      .post(
        this.apiService.getApiUrl(`Contributions/${contributionId}/addEntry`),
        entry
      )
      .pipe(
        map((result: any) => {
          return Object.assign(new ContributionEntry(), result.data);
        })
      );
  }

  updateEntry(
    contributionId: string,
    entry: ContributionEntry
  ): Observable<ContributionEntry> {
    return this.http
      .post(
        this.apiService.getApiUrl(
          `Contributions/${contributionId}/updateEntry/${entry.id}`
        ),
        entry
      )
      .pipe(
        map((result: any) => {
          return Object.assign(new ContributionEntry(), result.data);
        })
      );
  }

  addFeedback(
    contributionId: string,
    entryId: string,
    feedback: ContributionFeedback
  ) {
    return this.http
      .post(
        this.apiService.getApiUrl(
          `Contributions/${contributionId}/entries/${entryId}/addFeedback`
        ),
        feedback
      )
      .pipe(
        map((result: any) => {
          return Object.assign(new ContributionFeedback(), result.data);
        })
      );
  }

  getAttachments(contributionId: string, entryId: string) {
    return this.http.get(
      this.apiService.getApiUrl(
        `Contributions/${contributionId}/entries/${entryId}/getAttachments`
      )
    );
  }

  addAttachment(contributionId: string, entryId: string, file: string | Blob) {
    const formData = new FormData();
    formData.append('file', file);

    const headers = new HttpHeaders({
      uploadFile: 'use',
    });

    const request = new HttpRequest(
      'POST',
      this.apiService.getApiUrl(
        `Contributions/${contributionId}/entries/${entryId}/uploadAttachment`
      ),
      formData,
      { reportProgress: false, headers }
    );

    return this.http.request(request);
  }

  delete(contributionId: string) {
    return this.http.delete(
      this.apiService.getApiUrl(`Contributions/${contributionId}/erase`)
    );
  }

  removeAttachment(contributionId: string, entryId: string, fileId: string) {
    return this.http.delete(
      this.apiService.getApiUrl(
        `/Contributions/${contributionId}/entries/${entryId}/removeAttachment/${fileId}`
      )
    );
  }
}
