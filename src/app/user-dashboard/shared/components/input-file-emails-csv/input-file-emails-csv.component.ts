import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { AlertService } from '_shared/services';

@Component({
  selector: 'app-input-file-emails-csv',
  templateUrl: './input-file-emails-csv.component.html',
  styleUrls: ['./input-file-emails-csv.component.scss'],
})
export class InputFileEmailsCsvComponent {
  @ViewChild('fileUpload', { static: false }) fileInput: any;
  @Output() fileChanged = new EventEmitter<any>();
  filename;
  fileItem;
  loading = false;
  buttonText = 'Import';

  constructor(private alertService: AlertService) {}

  openDialog() {
    this.resetFileInput();
    this.fileInput.nativeElement.click();
  }

  onChangeUploadFile(files: FileList) {
    this.fileItem = files.item(0);
    this.filename = this.fileItem.name;
    if (files) {
      this.buttonText = 'Invite';
    } else {
      this.buttonText = 'Import';
    }
  }

  importCSV() {
    if (this.fileItem) {
      this.loading = true;
      this.readCsv(this.fileItem);
    } else {
      this.openDialog();
    }
  }

  private resetFileInput() {
    this.fileInput.nativeElement.value = '';
    this.filename = '';
    this.buttonText = 'Import';
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

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].split(',');
      if (line[0]) {
        const email = line[0].replace(/\"/g, '');
        const checkEmail = this.validateEmail(email);
        if (!checkEmail && i !== 0) {
          if (!csvStatus.errorLine) {
            csvStatus.errorLine = i;
            csvStatus.errorText = email;
          }
        } else if (checkEmail) {
          data.push(email);
          csvStatus.csvValid = true;
        }
      }
    }

    if (csvStatus.errorLine) {
      if (!csvStatus.csvValid) {
        this.alertService.showAlertDanger('Invalid CSV file format.');
      } else {
        this.alertService.showAlertDanger(
          'Error CSV: "' +
            csvStatus.errorText +
            '" is an invalid email address.'
        );
      }
      this.loading = false;
    } else {
      this.fileChanged.emit({ emails: data });
      this.loading = false;
    }
  }

  private validateEmail(email) {
    // tslint:disable-next-line:max-line-length
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
}
