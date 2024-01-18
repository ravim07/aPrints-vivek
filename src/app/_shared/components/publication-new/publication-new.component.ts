import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms/';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface NewPublicationData {
  name: string;
  organization: string;
  description: string;
  edit?: boolean;
}

@Component({
  selector: 'app-publication-new',
  templateUrl: './publication-new.component.html',
})
export class PublicationNewComponent {
  newPubForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<PublicationNewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NewPublicationData,
    private formBuilder: FormBuilder
  ) {
    this.newPubForm = this.formBuilder.group({
      name: [data.name, [Validators.required]],
      organization: [data.organization, [Validators.required]],
      description: [data.description, [Validators.required]],
    });
  }

  save() {
    this.dialogRef.close(this.newPubForm.value);
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }
}
