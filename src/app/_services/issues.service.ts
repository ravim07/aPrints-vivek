import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { IssuePreview } from '_models';
import { Issue } from '_models/issue.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class IssueService {
  constructor(private http: HttpClient, private apiService: ApiService) {
  }

  getIssues(filter: string): Observable<any> {
    return this.http
      .get<any>(this.apiService.getApiUrl('PublicationIssues?' + filter))
      .pipe(
        map((issues) => {
          const ret = { issues: [], totalResults: 0 };
          issues.results.forEach((issue) => {
            ret.issues.push(new Issue().deserialize(issue));
          });
          ret.totalResults = issues.totalResults;
          return ret;
        }),
        catchError(this.apiService.formatErrors)
      );
  }

  createIssue(pubId: string, issue: Issue): Observable<Issue> {
    const url = this.apiService.getApiUrl(
      'Publications/' + pubId + '/publicationIssues'
    );
    return this.http.post<any>(url, issue).pipe(
      map((data) => (issue = new Issue().deserialize(data))),
      catchError(this.apiService.formatErrors)
    );
  }

  getIssue(issueId: string): Observable<Issue> {
    const url = this.apiService.getApiUrl('PublicationIssues/' + issueId);
    return this.http.get<any>(url).pipe(
      map((issue) => (issue = new Issue().deserialize(issue))),
      catchError(this.apiService.formatErrors)
    );
  }

  updateIssue(issueId: string, issue: Issue | any): Observable<Issue> {
    const url = this.apiService.getApiUrl('PublicationIssues/' + issueId);
    return this.http.patch<any>(url, issue).pipe(
      map((data) => (issue = new Issue().deserialize(data))),
      catchError(this.apiService.formatErrors)
    );
  }

  confirmPrintingData(issueId: string, issue: Issue): Observable<Issue> {
    const prefs = {
      id: issueId,
      prefs: {
        deliveryDate: issue.deliveryDate,
        printingPreferences: issue.printingPreferences,
        mailingAddress: issue.mailingAddress,
      },
    };

    return this.http
      .post<any>(
        this.apiService.getApiUrl('PublicationIssues/printingPreferences'),
        prefs
      )
      .pipe(
        map((res) => (issue = new Issue().deserialize(res.data.result.issue))),
        catchError(this.apiService.formatErrors)
      );
  }

  setIssuesNumbers(data: any): Observable<any> {
    const url = this.apiService.getApiUrl('PublicationIssues/setIssuesNumbers');
    return this.http
      .post<any>(url, data)
      .pipe(catchError(this.apiService.formatErrors));
  }

  sendInvoiceMail(issueId: string, data: any): Observable<any> {
    // console.log(data);
    const url = this.apiService.getApiUrl(
      `PublicationIssues/${ issueId }/sendInvoiceMail`
    );
    return this.http
      .post<any>(url, data)
      .pipe(catchError(this.apiService.formatErrors));
  }

  previewInvoice(issueId: string, data: any): Observable<any> {
    const url = this.apiService.getApiUrl(
      `PublicationIssues/${ issueId }/previewInvoice`
    );

    return this.http
      .patch<any>(url, data, { responseType: 'blob' as 'json' })
      .pipe(catchError(this.apiService.formatErrors));
  }

  markInvoiceAsPaid(issueId: string): Observable<any> {
    // console.log(data);
    const url = this.apiService.getApiUrl(
      `PublicationIssues/${ issueId }/markInvoiceAsPaid`
    );
    return this.http
      .post<any>(url, {})
      .pipe(catchError(this.apiService.formatErrors));
  }

  sendInvoiceReminder(issueId: string): Observable<any> {
    // console.log(data);
    const url = this.apiService.getApiUrl(
      `PublicationIssues/${ issueId }/sendInvoiceReminder`
    );
    return this.http
      .post<any>(url, {})
      .pipe(catchError(this.apiService.formatErrors));
  }

  deleteIssue(issueId: string): Observable<any> {
    return this.http
      .delete<any>(
        this.apiService.getApiUrl('PublicationIssues/' + issueId + '/erase')
      )
      .pipe(catchError(this.apiService.formatErrors));
  }

  searchIssue(query: string): Observable<IssuePreview[]> {
    return this.http
      .post<any>(this.apiService.getApiUrl('PublicationIssues/search'), {
        search: query,
      })
      .pipe(
        map((pubs) => {
          const data = [];
          let pubObj;
          pubs.data.forEach((pub) => {
            pubObj = new IssuePreview().deserialize(pub);
            data.push(pubObj);
          });
          return data;
        }),
        catchError(this.apiService.formatErrors)
      );
  }
}
