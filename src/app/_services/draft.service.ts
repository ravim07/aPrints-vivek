import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { asyncForEach } from 'utils';
import { Draft, DraftFeedback, PaymentData } from '_models';
import { getFormattedDate, Issue } from '_models/issue.model';
import { UploadedFile } from '_models/uploaded-file.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class DraftService {
  private aHttp: HttpClient;

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    handler: HttpBackend
  ) {
    this.aHttp = new HttpClient(handler);
  }

  // create(issueId: string, fileItem: File) {
  //   const url = this.apiService.getApiUrl('PublicationIssues/' + issueId + '/publicationIssueDrafts');

  //   const formData: FormData = new FormData();
  //   formData.append('file', fileItem, fileItem.name);

  //   return this.http.post<any>(url, formData, {
  //     headers: new HttpHeaders({
  //       'uploadFile': 'use'
  //     }),
  //     observe: 'events',
  //     reportProgress: true
  //   }).pipe(
  //     map(issue => issue),
  //     catchError(this.apiService.formatErrors)
  //   );
  // }

  create(issueId: string, fileId: string): Observable<Draft> {
    return this.http
      .post(
        this.apiService.getApiUrl(
          'PublicationIssues/' + issueId + '/publicationIssueDrafts'
        ),
        { fileId: fileId }
      )
      .pipe(
        map((result: any) => {
          return Object.assign(new Draft(), result);
        })
      );
  }

  uploadFileForDraft(fileItem: File) {
    const url = this.apiService.getApiUrl('UploadedFiles/uploadS3PdfFile');

    const formData: FormData = new FormData();
    formData.append('file', fileItem, fileItem.name);

    return this.http
      .post<any>(url, formData, {
        headers: new HttpHeaders({
          uploadFile: 'use',
        }),
        observe: 'events',
        reportProgress: true,
      })
      .pipe(
        map((file) => file),
        catchError(this.apiService.formatErrors)
      );
  }

  generateThumbnail(fileId: string): Observable<UploadedFile> {
    return this.http
      .patch<any>(
        this.apiService.getApiUrl(`UploadedFiles/${ fileId }/generateThumbnail`),
        {}
      )
      .pipe(
        map(
          (file) => (file = new UploadedFile().deserialize(file.data.resultAPI))
        ),
        catchError(this.apiService.formatErrors)
      );
  }

  submitForReview(
    draftId: string,
    draftFeedback: DraftFeedback
  ): Observable<Issue> {
    const data = {
      id: draftId,
      msg: draftFeedback.msg,
    };

    return this.http
      .post<any>(
        this.apiService.getApiUrl('PublicationIssueDrafts/submitForReview'),
        data
      )
      .pipe(
        map(
          (issue) =>
            (issue = new Issue().deserialize(issue.data.issueAndTrack.issue))
        ),
        catchError(this.apiService.formatErrors)
      );
  }

  submitForPrint(issue: Issue, addresses): Observable<Issue> {
    const prefs = {
      id: issue.getCurrentDraft().id,
      prefs: {
        deliveryDate: issue.deliveryDate,
        printingPreferences: issue.printingPreferences,
        addresses,
      } /* ,
      'paymentData': paymentData */,
    };

    return this.http
      .post<any>(
        this.apiService.getApiUrl(
          'PublicationIssueDrafts/submitToPrintSchedule'
        ),
        prefs
      )
      .pipe(
        // tslint:disable-next-line:no-shadowed-variable
        map(
          (issue) =>
            (issue = new Issue().deserialize(issue.data.issueAndTrack.issue))
        ),
        catchError(this.apiService.formatErrors)
      );
  }

  submitPayment(
    issueId: string,
    issue: Issue,
    paymentData: PaymentData
  ): Observable<Issue> {
    const prefs = {
      id: issueId,
      prefs: {
        deliveryDate: issue.deliveryDate,
        printingPreferences: issue.printingPreferences,
        mailingAddress: issue.mailingAddress,
      },
      paymentData: paymentData,
    };

    return this.http
      .post<any>(
        this.apiService.getApiUrl('PublicationIssueDrafts/submitPayment'),
        prefs
      )
      .pipe(
        // tslint:disable-next-line:no-shadowed-variable
        map(
          (issue) =>
            (issue = new Issue().deserialize(issue.data.issueAndTrack.issue))
        ),
        catchError(this.apiService.formatErrors)
      );
  }

  changePaymentMethod(
    issueId: string,
    paymentData: PaymentData
  ): Observable<Issue> {
    const prefs = {
      id: issueId,
      paymentData: paymentData,
    };

    return this.http
      .post<any>(
        this.apiService.getApiUrl('PublicationIssueDrafts/changePaymentMethod'),
        prefs
      )
      .pipe(
        // tslint:disable-next-line:no-shadowed-variable
        map((issue) => (issue = new Issue().deserialize(issue.data))),
        catchError(this.apiService.formatErrors)
      );
  }

  setPricingDetails(issueId: string, pricingDetails: any): Observable<Issue> {
    const prefs = {
      id: issueId,
      pricingData: pricingDetails,
    };

    return this.http
      .post<any>(
        this.apiService.getApiUrl('PublicationIssueDrafts/setPricingDetails'),
        prefs
      )
      .pipe(
        // tslint:disable-next-line:no-shadowed-variable
        map((issue) => (issue = new Issue().deserialize(issue.data))),
        catchError(this.apiService.formatErrors)
      );
  }

  confirmPayment(issueId: string): Observable<Issue> {
    const prefs = { id: issueId };

    return this.http
      .post<any>(
        this.apiService.getApiUrl('PublicationIssueDrafts/confirmPayment'),
        prefs
      )
      .pipe(
        // tslint:disable-next-line:no-shadowed-variable
        map((issue) => (issue = new Issue().deserialize(issue.data))),
        catchError(this.apiService.formatErrors)
      );
  }

  markInReview(draftId: string) {
    const data = {
      id: draftId,
    };

    return this.http
      .post<any>(
        this.apiService.getApiUrl('PublicationIssueDrafts/markInReview'),
        data
      )
      .pipe(
        map(
          (issue) =>
            (issue = new Issue().deserialize(issue.data.issueAndTrack.issue))
        ),
        catchError(this.apiService.formatErrors)
      );
  }

  acceptDraft(draftId: string, msg: string): Observable<Issue> {
    const data = {
      id: draftId,
      msg: msg,
    };

    return this.http
      .post<any>(
        this.apiService.getApiUrl('/PublicationIssueDrafts/accept'),
        data
      )
      .pipe(
        map(
          (issue) =>
            (issue = new Issue().deserialize(issue.data.issueAndTrack.issue))
        ),
        catchError(this.apiService.formatErrors)
      );
  }

  rejectDraft(draftId: string, msg: string): Observable<Issue> {
    const data = {
      id: draftId,
      msg: msg,
    };

    return this.http
      .post<any>(
        this.apiService.getApiUrl('/PublicationIssueDrafts/reject'),
        data
      )
      .pipe(
        map(
          (issue) =>
            (issue = new Issue().deserialize(issue.data.issueAndTrack.issue))
        ),
        catchError(this.apiService.formatErrors)
      );
  }

  cancelReview(draftId: string, upload: boolean): Observable<Issue> {
    const data = { id: draftId, upload: upload };

    return this.http
      .post<any>(
        this.apiService.getApiUrl('/PublicationIssueDrafts/cancelReview'),
        data
      )
      .pipe(
        map(
          (issue) =>
            (issue = new Issue().deserialize(issue.data.issueAndTrack.issue))
        ),
        catchError(this.apiService.formatErrors)
      );
  }

  shipped(draftId: string, trackingUrl: string): Observable<Issue> {
    const data = {
      id: draftId,
      trackingUrl: trackingUrl,
    };

    if (!trackingUrl) {
      data['trackingUrl'] = '';
    }

    return this.http
      .post<any>(this.apiService.getApiUrl('PublicationIssues/shipped'), data)
      .pipe(
        map(
          (issue) =>
            (issue = new Issue().deserialize(issue.data.issueAndTrack.issue))
        ),
        catchError(this.apiService.formatErrors)
      );
  }

  delivered(draftId: string): Observable<Issue> {
    const data = {
      id: draftId,
    };

    return this.http
      .post<any>(this.apiService.getApiUrl('PublicationIssues/delivered'), data)
      .pipe(
        map(
          (issue) =>
            (issue = new Issue().deserialize(issue.data.issueAndTrack.issue))
        ),
        catchError(this.apiService.formatErrors)
      );
  }

  downloadPdf(url): any {
    return this.aHttp
      .get(url, { responseType: 'blob' })
      .pipe(catchError(this.apiService.formatErrors));
  }

  extractTextFromDraft(draftId: string): Observable<any> {
    const url = this.apiService.getApiUrl(
      `PublicationIssues/${ draftId }/extractTextFromFile`
    );
    return this.http
      .post<any>(url, {})
      .pipe(catchError(this.apiService.formatErrors));
  }

  addFeedback(draftId: string, msg: string) {
    return this.http
      .post<any>(
        this.apiService.getApiUrl(
          `PublicationIssueDrafts/${ draftId }/draftFeedback`
        ),
        { msg: msg }
      )
      .pipe(
        map(
          (draftFeedback) =>
            (draftFeedback = new DraftFeedback().deserialize(
              draftFeedback.data
            ))
        ),
        catchError(this.apiService.formatErrors)
      );
  }

  getFeedback(draftId: string) {
    return this.http
      .get<any>(
        this.apiService.getApiUrl(
          `PublicationIssueDrafts/${ draftId }/draftFeedback`
        )
      )
      .pipe(
        map(
          (draftFeedbacks) =>
            (draftFeedbacks = draftFeedbacks.map((o) =>
              new DraftFeedback().deserialize(o)
            ))
        ),
        catchError(this.apiService.formatErrors)
      );
  }

  async getDraftFeedbackArr(
    issue: Issue,
    sort = false
  ): Promise<DraftFeedback[]> {
    const draftIds = [];
    issue.publicationIssueDrafts.map((i) => draftIds.push(i.id));
    let feedbackArr = [];
    let draftVersion = '';
    let versionNumber = 0;

    await asyncForEach(
      draftIds,
      async (id) =>
        new Promise((resolve, reject) => {
          try {
            this.getFeedback(id).subscribe(async (o) => {
              if (o.length > 0) {
                if (draftVersion !== id) {
                  draftVersion = id;
                  versionNumber++;
                }
                await o.map((i) => {
                  i.draftVersion = versionNumber;
                  i.issueName = getFormattedDate(issue.deliveryDate);
                  feedbackArr.push(i);
                  return i;
                });
              }
              resolve(true);
            });
          } catch (error) {
            reject(error);
          }
        })
    );

    if (sort) {
      feedbackArr = await feedbackArr.sort((a, b) => {
        if (a.date > b.date) {
          return -1;
        }
        if (a.date < b.date) {
          return 1;
        }
      });
    }
    return feedbackArr;
  }

  getDraftFeedbackArr2(issue: Issue, sort = false): Promise<DraftFeedback[]> {
    return new Promise((resolve, reject) => {
      try {
        this.http
          .get<any>(
            this.apiService.getApiUrl(
              `PublicationIssues/${ issue.id }/getAllDraftFeedback`
            )
          )
          .pipe(
            map(
              (draftFeedbacks) =>
                (draftFeedbacks = draftFeedbacks.data.map((o) =>
                  new DraftFeedback().deserialize(o)
                ))
            ),
            catchError(this.apiService.formatErrors)
          )
          .subscribe(async (feedbackArr) => {
            // console.log(feedbackArr);
            if (sort) {
              feedbackArr = await feedbackArr.sort(
                (a: DraftFeedback, b: DraftFeedback) => {
                  if (a.date > b.date) {
                    return -1;
                  }
                  if (a.date < b.date) {
                    return 1;
                  }
                }
              );
            }
            resolve(feedbackArr);
          });
      } catch (error) {
        console.log(
          'Something whent wrong while fetching the feedback:',
          error
        );
        reject(error);
      }
    });
  }
}
