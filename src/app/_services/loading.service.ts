import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { LoadingComponent } from '../components';

@Injectable({ providedIn: 'root' })
export class LoadingService implements OnDestroy {
  dialogRef: MatDialogRef<LoadingComponent>;

  constructor(private dialog: MatDialog) {}

  showAnimation(title: string, description: string) {
    this.dialogRef = this.dialog.open(LoadingComponent, {
      width: '350px',
      height: '300px',
      data: {
        title,
        description,
      },
      panelClass: 'loading-dialog',
      disableClose: true,
      autoFocus: true,
    });

    this.dialogRef
      .afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe((result) => {
        console.log('Loading dialog was closed');
      });
  }

  hideAnimation() {
    this.dialogRef.close();
  }

  changeAnimationData(title, description) {
    if (this.dialogRef) {
      this.dialogRef.componentInstance.data = {
        title,
        description,
      };
    } else {
      this.showAnimation(title, description);
    }
  }

  ngOnDestroy(): void {}
}
