import { ApplicationRef, Injectable, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SwUpdate } from '@angular/service-worker';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { concat, interval } from 'rxjs';
import { first } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UpdateSwService implements OnDestroy {
  constructor(
    appRef: ApplicationRef,
    private swUpdate: SwUpdate,
    private snackbar: MatSnackBar
  ) {
    // Allow the app to stabilize first, before starting polling for updates with `interval()`.
    const appIsStable$ = appRef.isStable.pipe(
      first((isStable) => isStable === true)
    );
    const everyHalfHour$ = interval(0.5 * 60 * 60 * 1000);
    const everyHalfHourOnceAppIsStable$ = concat(appIsStable$, everyHalfHour$);

    everyHalfHourOnceAppIsStable$.subscribe(() => {
      console.log('30mins mark - App is Stable - Checking for updates');
      this.checkUpdates();
    });

    if (!this.swUpdate.isEnabled) {
      console.log('swUpdate.isEnabled -> Nope 🙁');
    } else {
      console.log('swUpdate.isEnabled -> Yay 😀');
    }
  }

  checkUpdates() {
    console.log('Checking SW Updates!');
    this.swUpdate.checkForUpdate();
    this.informUser();
  }

  informUser() {
    this.swUpdate.available.pipe(untilDestroyed(this)).subscribe((event) => {
      const snack = this.snackbar.open(
        'A new version of aPrintis is available.',
        'Reload',
        {
          duration: 7000,
          panelClass: 'alert-success',
        }
      );
      snack.onAction().subscribe(() => {
        this.swUpdate.activateUpdate().then(() => document.location.reload());
      });
    });
  }

  ngOnDestroy() {}
}
