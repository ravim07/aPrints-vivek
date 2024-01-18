import { Injectable, OnDestroy } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { untilDestroyed } from 'ngx-take-until-destroy';

@Injectable({ providedIn: 'root' })
export class LogUpdateService implements OnDestroy {
  constructor(updates: SwUpdate) {
    updates.available.pipe(untilDestroyed(this)).subscribe((event) => {
      console.log('current version is', event.current);
      console.log('available version is', event.available);
    });
    updates.activated.pipe(untilDestroyed(this)).subscribe((event) => {
      console.log('old version was', event.previous);
      console.log('new version is', event.current);
    });
  }

  ngOnDestroy() {}
}
