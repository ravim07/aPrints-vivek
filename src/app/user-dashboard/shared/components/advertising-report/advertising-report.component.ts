import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ExportCsvService } from 'user-dashboard/shared/services';
import { AdvertisingSummary } from '_models/advertising-summary.model';
import { PageAdPayment } from '_models/page-ad-payment.model';
import { Publication } from '_models/publication.model';
import { TableBaseComponent } from '../table-base/table-base.component';

interface AdPaymentsSummary {
  adPayments: PageAdPayment[];
  summary: AdvertisingSummary;
}

@Component({
  selector: 'app-advertising-report',
  templateUrl: './advertising-report.component.html',
})
export class AdvertisingReportComponent extends TableBaseComponent {
  publication: Publication;
  adPaymentsSummary: AdPaymentsSummary;
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = [
    'name',
    'amount',
    'sponsorName',
    'sponsorEmail',
    'createdAt',
    'mailingAddress',
  ];
  csvHeaders: string[] = [
    'Ad Type',
    'Amount',
    'Name',
    'Email',
    'Date',
    'Mailing address',
  ];
  csvFields: string[] = [
    'typeLiteral',
    'amount',
    'advertiserName',
    'advertiserEmail',
    'createdAt',
    'mailingAddress',
  ];
  active = true;
  tableData = [];

  constructor(
    public dialogRef: MatDialogRef<AdvertisingReportComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    public exportCsvService: ExportCsvService
  ) {
    super();
    this.publication = data.publication;
    this.adPaymentsSummary = data.adPayments;
    this.loadData();
  }

  loadData() {
    this.tableData = this.adPaymentsSummary.adPayments.map((item) => {
      return {
        typeLiteral:
          item.pageAdPricingDetails && item.pageAdPricingDetails.typeLiteral,
        amount: item.pageAdPricingDetails && item.pageAdPricingDetails.amount,
        advertiserName: item.advertiser.name,
        advertiserEmail: item.advertiser.email,
        createdAt: item.createdAt,
        mailingAddress:
          `${item.advertiser.mailingAddress.address1}` +
          `${
            item.advertiser.mailingAddress.address2
              ? ' ' + item.advertiser.mailingAddress.address2
              : ''
          }` +
          `, ${item.advertiser.mailingAddress.city}, ` +
          `${item.advertiser.mailingAddress.state} ` +
          `${item.advertiser.mailingAddress.zip}`,
      };
    });
    this.dataSource = new MatTableDataSource(this.tableData);
  }

  downloadCsv() {
    this.exportCsvService.csvDownload(
      this.csvHeaders,
      this.tableData,
      this.csvFields,
      `advertisingReport-${new Date().toISOString()}`
    );
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
