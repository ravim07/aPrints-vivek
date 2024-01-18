import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { TriggerOrCallbackOptions } from '_models/trigger.interface';
import { ConfirmComponent } from '_shared/components/confirm/confirm.component';

@Injectable({
  providedIn: 'root',
})
export class BaseActionsService implements OnDestroy {
  constructor(public dialog: MatDialog) {
  }

  setDialogConfig(panelClass: string[], data: any): MatDialogConfig {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.panelClass = panelClass;
    dialogConfig.data = data;
    return dialogConfig;
  }

  triggerOrCallback(options: TriggerOrCallbackOptions, result?: any) {
    if (options.obs) {
      options.obs.subscribe((result) => {
        this.cbHelper(options, result);
      });
    } else {
      this.cbHelper(options, result);
    }
  }

  cbHelper(options: TriggerOrCallbackOptions, result?: any) {
    if (options.cb) {
      options.cb(result);
    }
    if (options.trigger) {
      options.trigger.emitter.emit(options.trigger.event);
    }
  }

  confirmAction(
    data: {
      msg: string;
      title?: string;
      okBtnTxt: string;
      cancelBtnTxt: string;
    },
    options: TriggerOrCallbackOptions
  ): void {
    const dialogConfig = this.setDialogConfig(
      [
        'flat-dialog',
        'confirmation',
        'space-around',
        'height-330',
        'width-700',
      ],
      data
    );
    this.dialog
      .open(ConfirmComponent, dialogConfig)
      .beforeClosed()
      .pipe(untilDestroyed(this))
      .subscribe((result) => {
        if (result === true) {
          this.triggerOrCallback(options);
        } else if (options.cbCancel) {
          options.cbCancel();
        }
      });
  }

  ngOnDestroy(): void {
  }
}
