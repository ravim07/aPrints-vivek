import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';

import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  protected apiBaseUrl = environment.apiBaseUrl;

  constructor() { }

  getApiUrl(path: string) {
    return this.apiBaseUrl + path;
  }

  formatErrors(error: any) {
    console.error('Error(Service): ', error);
    return throwError(error.error);
  }
}
