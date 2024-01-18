import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { printingPreferencesOptions } from '_models';
import { Issue } from '_models/issue.model';

@Component({
  selector: 'app-submit-to-review',
  templateUrl: './submit-to-review.component.html',
})
export class SubmitToReviewComponent {
  printPrefsOptions = printingPreferencesOptions;
  printingPrefsForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<SubmitToReviewComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { issue: Issue; noWarning: boolean }
  ) {
    const hasPrefs = data.issue.printingPreferences;
    this.printingPrefsForm = new FormGroup({
      trim: new FormControl(
        hasPrefs
          ? data.issue.printingPreferences.trim
          : this.printPrefsOptions.trim[0].id,
        [Validators.required]
      ),
      insidePages: new FormControl(
        hasPrefs
          ? data.issue.printingPreferences.insidePages
          : this.printPrefsOptions.insidePages[6].id.toString(),
        [Validators.required]
      ),
      numberOfCopies: new FormControl(
        hasPrefs
          ? data.issue.printingPreferences.getStrNumberOfCopies()
          : this.printPrefsOptions.numberOfCopies[5].id.toString(),
        [Validators.required]
      ),
      color: new FormControl(
        hasPrefs ? data.issue.printingPreferences.color : 'color',
        [Validators.required]
      ),
      cover: new FormControl(
        hasPrefs ? data.issue.printingPreferences.cover : 'Same as Inside',
        [Validators.required]
      ),
      binding: new FormControl(
        hasPrefs ? data.issue.printingPreferences.binding : 'Saddle Stitch',
        [Validators.required]
      ),
    });
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close(this.printingPrefsForm.value);
  }
}
