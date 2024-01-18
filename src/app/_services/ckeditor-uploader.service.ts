import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { ApiService } from '_services/api.service';

@Injectable()
export class CkeditorUploaderService extends ApiService {
  requests = [];
  pendingFiles: File[] = [];

  constructor(private http: HttpClient) {
    super();
  }

  uploadNewFile(file, loader) {
    const endpoint = this.getApiUrl('UploadedFiles/uploadS3OnlyFile');
    const data = new FormData();
    data.append('file', file);

    const headers = new HttpHeaders({
      'uploadFile': 'use',
    });

    const httpRequest = new HttpRequest('POST', endpoint, data, { headers, reportProgress: true });

    const request = this.http.request(httpRequest)
      .pipe(tap((evt: any) => {
        if (!evt.status) {
          loader.uploadTotal = evt.total;
          loader.uploaded = evt.loaded;
        }
      })).toPromise();
    this.requests.push(request);
    return request;
  }

  attachPendingFile(file) {
    this.pendingFiles.push(file);
  }

  processPendingFiles(endpoint) {
    return this.pendingFiles.map((file) => {
      const data = new FormData();
      data.append('file', file);

      const headers = new HttpHeaders({
        'uploadFile': 'use',
      });
      return this.http.post(endpoint, data, { headers, reportProgress: true });
    });


  }
}

