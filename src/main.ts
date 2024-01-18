import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import 'hammerjs';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

document.addEventListener('DOMContentLoaded', () => {
  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .then(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/ngsw-worker.js').then(
          function (registration) {
            console.log(
              'Service Worker registration successful with scope: ',
              registration.scope
            );
          },
          function (err) {
            console.log('Service Worker registration failed: ', err);
          }
        );

        navigator.serviceWorker.ready.then(function (registration) {
          console.log('Service Worker ready');
          forceSWupdate();
        });
      }
    })
    .catch((err) => console.error(err));
});

function forceSWupdate() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      for (const registration of registrations) {
        registration.update();
        console.log(
          'Service Worker update successful with scope: ',
          registration.scope
        );
      }
    });
  }
}
