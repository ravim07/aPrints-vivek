import {
  TransferState,
  makeStateKey
} from '@angular/platform-browser';
import {
  Injectable
} from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse
} from '@angular/common/http';
import {
  Observable,
  of
} from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class BrowserStateInterceptor implements HttpInterceptor {

  constructor(
    private transferState: TransferState,
  ) {}

  intercept(req: HttpRequest < any > , next: HttpHandler): Observable < HttpEvent < any >> {
    if (req.method !== 'GET') {
      return next.handle(req);
    }

    const storedResponse: string = this.transferState.get(makeStateKey(req.url), null);
    if (storedResponse) {
      return of(new HttpResponse({
        body: storedResponse,
        status: 200
      }));
    }

    return next.handle(req);
  }
}
