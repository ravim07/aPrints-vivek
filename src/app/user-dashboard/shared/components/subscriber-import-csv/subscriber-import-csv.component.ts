import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { AlertService } from '_shared/services';

interface SubscriptionObj{
  subscriptionType: 'selfManaged';
  amount: number;
  email: string;
  name: string;
  lastName: string;
  mailingAddress: {
    addressedTo: string;
    address1: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    shipTo: string;
  };
}

@Component({
  selector: 'app-subscriber-import-csv',
  templateUrl: './subscriber-import-csv.component.html',
  styleUrls: ['./subscriber-import-csv.component.scss']
})
export class SubscriberImportCsvComponent {
  @ViewChild('fileUpload', {static: false}) fileInput: any;
  @Output() fileChanged = new EventEmitter<any>();
  filename;
  fileItem;
  loading = false;
  buttonText = 'Import';

  constructor(private alertService: AlertService) { }

  openDialog() {
    this.resetFileInput();
    this.fileInput.nativeElement.click();
  }

  onChangeUploadFile(files: FileList) {
    this.fileItem = files.item(0);
    this.filename = this.fileItem.name;
    if (files) {
      this.buttonText = 'Import';
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
    try {
      const lines = csvData.split(/\r\n|\n/);
      const data: SubscriptionObj[] = [];
      const csvStatus = {
        errorLine: null,
        errorText: '',
        errorField: '',
        csvValid: false
      };

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].split(',');
        if (line[0]) {
          const fullname = line[0].replace(/\"/g, '');
          const email = line[1].replace(/\"/g, '');
          const phone = line[2].replace(/\"/g, '');
          const addr = line[3].replace(/\"/g, '');
          const city = line[4].replace(/\"/g, '');
          const state = line[5].replace(/\"/g, '');
          const zip = line[6].replace(/\"/g, '');
          const checkEmail = this.validateEmail(email);
          const checkZip = this.validateZip(zip);
          if (!checkEmail && !checkZip && i !== 0) {
            if (!csvStatus.errorLine) {
              csvStatus.errorLine = i;
              if (!checkEmail) {
                csvStatus.errorText = email;
                csvStatus.errorField = 'email address';
                throw csvStatus;
              }
              if (!checkZip) {
                csvStatus.errorText = zip;
                csvStatus.errorField = 'zip code';
                throw csvStatus;
              }
            }
          } else if (checkEmail) {
            const obj: SubscriptionObj = {
              subscriptionType: 'selfManaged',
              amount: 0,
              email: email,
              name: fullname,
              lastName: '',
              mailingAddress: {
                addressedTo: fullname,
                address1: addr,
                city: city,
                state: state,
                zip: zip,
                phone: phone,
                shipTo: fullname
              }
            };
            data.push(obj);
            csvStatus.csvValid = true;
          }
        }
      }
      this.fileChanged.emit({ data: data });
      this.loading = false;
    } catch (csvStatus) {
      if (csvStatus.errorLine) {
        if (!csvStatus.csvValid) {
          this.alertService.showAlertDanger('Invalid CSV file format.');
        } else {
          this.alertService.showAlertDanger(
            `Error CSV: ${csvStatus.errorText} is an invalid ${csvStatus.errorField}.`
            );
        }
        this.loading = false;
      } else {
        this.alertService.showAlertDanger('Invalid CSV file format. Check if you missed a separator!(,)');
      }
    }
  }

  private validateEmail(email) {
    // tslint:disable-next-line:max-line-length
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  private validateZip(zip) {
    const re = /^[0-9]{5}(?:-[0-9]{4})?$/;
    return re.test(String(zip));
  }
}
