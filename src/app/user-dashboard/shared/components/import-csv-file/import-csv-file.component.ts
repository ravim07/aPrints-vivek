import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ImportCsvFileDialogData {
  inputTooltip: string;
  linkTooltip: string;
  title: string;
  exampleLink: string;
  inputType: string;
  type: string;
}

@Component({
  templateUrl: './import-csv-file.component.html',
})
export class ImportCsvFileComponent {
  constructor(
    public dialogRef: MatDialogRef<ImportCsvFileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImportCsvFileDialogData
  ) {}

  fileCsvChanged(evt: any) {
    this.dialogRef.close(evt);
  }

  goBack(): void {
    this.dialogRef.close(this.data.type);
  }

  close(): void {
    this.dialogRef.close('close');
  }
}
