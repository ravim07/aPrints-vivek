import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
})
export class ConfirmComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      msg: string;
      title?: string;
      okBtnTxt: string;
      diffCancelCloseValue?: boolean;
      cancelBtnTxt: string;
    }
  ) {}

  onCancelClick(cancelPressed: boolean): void {
    this.dialogRef.close(cancelPressed ? 'cancel' : 'close');
  }
}
