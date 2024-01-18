import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DiscussionEntry, Invoice, PublicationPreview, role } from '_models';
import { Publication } from '_models/publication.model';
import { ApiService } from './api.service';
import { Issue } from '_models/issue.model';

@Injectable({
  providedIn: 'root',
})
export class PublicationService {
  constructor(private http: HttpClient, private apiService: ApiService) {
  }

  createPublication(publication: Publication): Observable<Publication> {
    return this.http
      .post<any>(this.apiService.getApiUrl('Publications/create'), publication)
      .pipe(
        map((pub) => {
          pub = new Publication().deserialize(pub.data);
          pub.role = role.managingEditor;
          return pub;
        }),
        catchError(this.apiService.formatErrors)
      );
  }

  getPublications(): Observable<Publication[]> {
    return this.http
      .get<any>(this.apiService.getApiUrl('Publications/findAll'))
      .pipe(
        map((pubs) => {
          const data = [];
          const processRole = function (inRole) {
            let pubObj;
            pubs.data[inRole].forEach((pub) => {
              pubObj = new Publication().deserialize(pub);
              pubObj.role = inRole;
              data.push(pubObj);
            });
          };

          processRole('managingEditor');
          processRole('editorialStaff');
          processRole('contributor');
          processRole('advertiser');

          data.sort((pub1, pub2) => {
            if (pub1.dateCreated.valueOf() < pub2.dateCreated.valueOf()) {
              return -1;
            } else if (
              pub1.dateCreated.valueOf() > pub1.dateCreated.valueOf()
            ) {
              return 1;
            } else {
              return 0;
            }
          });
          return data;
        }),
        catchError(this.apiService.formatErrors)
      );
  }

  getIssuesRelated(pubId: string): Observable<Issue[]> {
    return this.http
      .get<any>(this.apiService.getApiUrl(`Publications/${ pubId }/PublicationIssues`))
      .pipe(
        map((data) => {
          return data.map(pub => new Issue().deserialize(pub));
        }),
        catchError(this.apiService.formatErrors)
      );
  }

  getPublication(pubId: string): Observable<Publication> {
    return this.http
      .get<Publication>(this.apiService.getApiUrl('Publications/' + pubId))
      .pipe(
        map((pub) => {
          return (pub = new Publication().deserialize(pub));
        }),
        catchError(this.apiService.formatErrors)
      );
  }

  getPublicationPreview(pubId: string): Observable<PublicationPreview> {
    return this.http
      .get<any>(
        this.apiService.getApiUrl(
          'PublicationIssues/' + pubId + '/getPublication'
        )
      )
      .pipe(
        map((pub) => (pub = new PublicationPreview().deserialize(pub.data))),
        catchError(this.apiService.formatErrors)
      );
  }

  updatePublication(pubId: string, publication): Observable<Publication> {
    return this.http
      .patch<any>(
        this.apiService.getApiUrl('Publications/' + pubId),
        publication
      )
      .pipe(
        map((pub) => (pub = new Publication().deserialize(pub))),
        catchError(this.apiService.formatErrors)
      );
  }

  searchPublication(query: string): Observable<Publication[]> {
    return this.http
      .post<any>(this.apiService.getApiUrl('Publications/search'), {
        search: query,
      })
      .pipe(
        map((pubs) => {
          const data = [];
          let pubObj;
          pubs.data.forEach((pub) => {
            pubObj = new Publication().deserialize(pub);
            data.push(pubObj);
          });
          return data;
        }),
        catchError(this.apiService.formatErrors)
      );
  }

  newDiscussionEntry(pubId: string, data: any): Observable<DiscussionEntry> {
    return this.http
      .post<any>(
        this.apiService.getApiUrl(`Publications/${ pubId }/discussionEntries`),
        data
      )
      .pipe(
        map((res) => {
          res = new DiscussionEntry().deserialize(res);
          return res;
        }),
        catchError(this.apiService.formatErrors)
      );
  }

  createDiscussionCommentAndAttachFile(
    pubId: string,
    issueId: string,
    file: string | Blob
  ) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('issueId', issueId);

    const headers = new HttpHeaders({
      uploadFile: 'use',
    });

    const request = new HttpRequest(
      'POST',
      this.apiService.getApiUrl(
        `Publications/${ pubId }/createDiscussionCommentAndAttachFile`
      ),
      formData,
      { reportProgress: true, headers }
    );

    return this.http.request(request);
  }

  getStripeAccount(pubId) {
    return this.http.get(this.apiService.getApiUrl(`Publications/${ pubId }/stripeAccount`))
      .pipe(
        map((res) => {
          return res;
        }),
        catchError(this.apiService.formatErrors)
      );
  }

  createStripeAccount(pubId, data) {
    return this.http.post(this.apiService.getApiUrl(`Publications/${ pubId }/stripeAccount`), data)
      .pipe(
        map((res) => {
          return res;
        }),
        catchError(this.apiService.formatErrors)
      );
  }

  getPayOuts(pubId) {
    return this.http.get(this.apiService.getApiUrl(`Publications/${ pubId }/listPayOuts`))
      .pipe(
        map((res: any) => {
          return res.data;
        }),
        catchError(this.apiService.formatErrors)
      );
  }

  getInvoices(pubId): Observable<Invoice[]> {
    return this.http.get(this.apiService.getApiUrl(`Publications/${ pubId }/invoices`))
      .pipe(map((res: any) => {
        return res.data.invoices.map(i => new Invoice().deserialize(i, i.issue));
      }), catchError(this.apiService.formatErrors));
  }

}
