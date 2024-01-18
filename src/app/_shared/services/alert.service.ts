import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedModule } from '_shared/shared.module';

@Injectable({ providedIn: SharedModule })
export class AlertService {
  constructor(private snackBar: MatSnackBar) {}

  showAlertSuccess(message: string, position: any = 'top', duration = this.timeToShowMsg(message)) {
    this.snackBar.open(message, 'Close', {
      duration: duration,
      verticalPosition: position,
      panelClass: 'alert-success',
    });
  }

  showAlertDanger(error: string, position: any = 'top') {
    this.snackBar.open(error + '.', 'Close', {
      duration: this.timeToShowMsg(error),
      verticalPosition: position,
      panelClass: 'alert-danger',
    });
  }

  showAlertDangerApiError(
    errorApi: any,
    defaultError?: string,
    position: any = 'top'
  ) {
    const msg = this.errorApiToString(errorApi, defaultError) + '.';
    this.snackBar.open(msg, 'Close', {
      duration: this.timeToShowMsg(msg),
      verticalPosition: position,
      panelClass: 'alert-danger',
    });
  }

  private timeToShowMsg(msg) {
    return Math.min(Math.max(msg.length * 50, 2000), 7000);
  }

  errorApiToString(errorApi: any, defaultError?: string) {
    let defError = 'An error occurred, please try again later';
    if (defaultError) {
      defError = defaultError;
    }

    return errorApi.error && errorApi.error.msg ? errorApi.error.msg : defError;
  }
}
