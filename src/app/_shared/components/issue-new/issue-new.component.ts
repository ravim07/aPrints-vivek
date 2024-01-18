import { Component, Inject, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms/';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { printingPreferencesOptions } from '_models';
import { Publication } from '_models/publication.model';
import { CalculatorComponent } from '_shared/components';
import { Router } from '@angular/router';

export interface NewIssueData {
  name: string;
  publication: Publication;
  edit?: boolean;
}

@Component({
  selector: 'app-issue-new',
  templateUrl: './issue-new.component.html',
  styleUrls: ['./issue-new.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class IssueNewComponent {
  @ViewChild('calculator', { static: false }) calculator: CalculatorComponent;

  newIssueForm: FormGroup;
  addressGroup: FormGroup;
  defaultPrintingPreferencesGroup: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<IssueNewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NewIssueData,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.defaultPrintingPreferencesGroup = this.formBuilder.group({
      trim: [printingPreferencesOptions.trim[0].id],
      insidePages: [printingPreferencesOptions.insidePages[6].id],
      numberOfCopies: [printingPreferencesOptions.numberOfCopies[5].id],
      color: [printingPreferencesOptions.color[0].id],
      cover: [printingPreferencesOptions.cover[0].id],
      binding: [printingPreferencesOptions.binding[0].value],
    });
    this.addressGroup = this.formBuilder.group({
      organization: [data.publication.mailingAddress.organization],
      addressedTo: [data.publication.mailingAddress.addressedTo],
      address1: [data.publication.mailingAddress.address1],
      address2: [data.publication.mailingAddress.address2],
      city: [data.publication.mailingAddress.city],
      state: [data.publication.mailingAddress.state],
      zip: [data.publication.mailingAddress.zip],
      phone: [data.publication.mailingAddress.phone],
    });
    this.newIssueForm = this.formBuilder.group({
      name: [data.name, [Validators.required]],
      printingPreferences: this.defaultPrintingPreferencesGroup,
      mailingAddress: this.addressGroup,
    });
  }

  save() {
    this.dialogRef.close({ data: this.newIssueForm.value });
  }

  completeLater(): void {
    this.dialogRef.close({});
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  onCalcForm(form) {
    const values = form.value;
    this.newIssueForm.patchValue({
      printingPreferences: {
        insidePages: values.numPages,
        numberOfCopies: values.numCopies,
        color: values.color,
      },
    });
  }

  onRequestCustomQuote() {
    this.router.navigate(['/quote']);
    this.dialogRef.close();
  }
}
