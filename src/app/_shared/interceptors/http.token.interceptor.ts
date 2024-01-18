import { Injectable, Injector, Inject } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthService } from 'auth/auth.service';

import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { tap, finalize } from 'rxjs/operators';

@Injectable()
export class HttpTokenInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, @Inject(PLATFORM_ID) private platformId: Object) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    let headersConfig = {};

    if (isPlatformBrowser(this.platformId)) {
      // Client only code.
      if (!req.headers.get('uploadFile')) {
        headersConfig = {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        };
      }

      const token = this.authService.getToken();
      if (token) {
        headersConfig['Authorization'] = token;
      }
    }

    const request = req.clone({ setHeaders: headersConfig });

    const started = Date.now();
    let ok: string;

    return next.handle(request).pipe(
      tap(
        (event: HttpEvent<any>) => ok = event instanceof HttpResponse ? 'succeeded' : '',
        (error: HttpErrorResponse) => ok = 'failed'
      ),
      // Log when response observable either completes or errors
      finalize(() => {
        const elapsed = Date.now() - started;
        const msg = `${req.method} "${req.urlWithParams}" ${ok} in ${elapsed} ms.`;
        console.log(msg);
      })
    );
  }
}
