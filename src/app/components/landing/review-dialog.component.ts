
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Review } from '_models';

@Component({
  selector: 'app-review-dialog',
  templateUrl: 'review-dialog.component.html',
})
export class ReviewDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ReviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Review) {}

  close(): void {
    this.dialogRef.close();
  }
}
