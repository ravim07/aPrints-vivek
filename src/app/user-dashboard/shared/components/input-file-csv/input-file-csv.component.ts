import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { AlertService } from '_shared/services';

@Component({
  selector: 'app-input-file-csv',
  templateUrl: './input-file-csv.component.html',
  styleUrls: ['./input-file-csv.component.scss'],
})
export class InputFileCsvComponent {
  @ViewChild('fileUpload', { static: false }) fileInput: any;
  @Output() fileChanged = new EventEmitter<any>();
  filename;
  fileItem;
  loading = false;
  buttonText = 'Select File';

  constructor(private alertService: AlertService) {
  }

  openDialog() {
    this.resetFileInput();
    this.fileInput.nativeElement.click();
  }

  onChangeUploadFile(files: FileList) {
    this.fileItem = files.item(0);
    this.filename = this.fileItem.name;
  }

  importCSV() {
    if (this.fileItem) {
      this.loading = true;
      this.readCsv(this.fileItem);
      // this.fileChanged.emit(this.fileItem)
      this.loading = false;
    } else {
      this.openDialog();
    }
  }

  private resetFileInput() {
    this.fileInput.nativeElement.value = '';
    this.filename = '';
    this.buttonText = 'Select File';
  }

  private readCsv(fileItem) {
    const reader: FileReader = new FileReader();
    reader.readAsText(fileItem);
    reader.onload = (e) => {
      const csv = reader.result;
      this.processCsv(csv);
    };
  }

  private processCsv(csvData) {
    const lines = csvData.split(/\r\n|\n/);
    const data = [];
    const csvStatus = {
      errorLine: null,
      errorText: '',
      csvValid: false,
    };

    const fields = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].split(',');

      const item = line.reduce((prev, value, index) => {
        prev[fields[index]] = value.trim();
        return prev;
      }, {});
      data.push(item);
    }

    if (csvStatus.errorLine) {
      if (!csvStatus.csvValid) {
        this.alertService.showAlertDanger('Invalid CSV file format.');
      } else {
        this.alertService.showAlertDanger(
          'Error CSV: "' +
          csvStatus.errorText +
          '"CSV is an invalid.'
        );
      }
      this.loading = false;
    } else {
      this.fileChanged.emit({ data });
      this.loading = false;
    }
  }

}
