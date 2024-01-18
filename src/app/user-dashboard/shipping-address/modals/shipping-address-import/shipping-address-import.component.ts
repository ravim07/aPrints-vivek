import { Component, Inject, OnInit } from '@angular/core';
import { copyToClipboard } from 'user-dashboard/shared/services/utils';
import { environment } from '../../../../../environments/environment';
import { AlertService } from '_shared/services';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-shipping-address-import',
  templateUrl: './shipping-address-import.component.html',
  styleUrls: ['./shipping-address-import.component.scss']
})
export class ShippingAddressImportComponent implements OnInit {

  link;

  constructor(private alertService: AlertService, @Inject(MAT_DIALOG_DATA) private data) {
  }

  ngOnInit() {
  }

  save() {
  }

  copyUrl() {
    copyToClipboard(
      environment.frontBaseUrl + '/p/' + this.data.url + this.data.queryParams
    );
    this.alertService.showAlertSuccess('Link copied to clipboard.');
  }
}
