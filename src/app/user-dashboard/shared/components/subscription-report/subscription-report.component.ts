import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ExportCsvService } from 'user-dashboard/shared/services';
import { Publication } from '_models/publication.model';
import { SubscriptionSummary } from '_models/subscription-summary.model';
import { Subscription } from '_models/subscription.model';
import { TableBaseComponent } from '../table-base/table-base.component';

@Component({
  selector: 'app-subscription-report',
  templateUrl: './subscription-report.component.html',
})
export class SubscriptionReportComponent extends TableBaseComponent {
  publication: Publication;
  subscriptions: {
    subscriptions: Subscription[];
    summary: SubscriptionSummary;
  };
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = [
    'name',
    'amount',
    'subscriberName',
    'subscriberEmail',
    'createdAt',
    'mailingAddress',
  ];
  active = true;
  tableData = [];

  constructor(
    public dialogRef: MatDialogRef<SubscriptionReportComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    public exportCsvService: ExportCsvService
  ) {
    super();
    this.publication = data.publication;
    this.subscriptions = data.subscriptions;
    this.loadData();
  }

  loadData() {
    this.tableData = this.subscriptions.subscriptions.map((item) => {
      return {
        name: item.subscriptionTypeDetails.name,
        amount: item.subscriptionTypeDetails.amount,
        subscriberName: item.subscriber.name,
        subscriberEmail: item.subscriber.email,
        createdAt: item.createdAt,
        mailingAddress:
          `${item.subscriber.mailingAddress.address1}` +
          `${
            item.subscriber.mailingAddress.address2
              ? ' ' + item.subscriber.mailingAddress.address2
              : ''
          }` +
          `, ${item.subscriber.mailingAddress.city}, ` +
          `${item.subscriber.mailingAddress.state} ` +
          `${item.subscriber.mailingAddress.zip}`,
      };
    });
    this.dataSource = new MatTableDataSource(this.tableData);
  }

  downloadCsv() {
    this.exportCsvService.csvDownload(
      ['Subscription', 'Amount', 'Name', 'Email', 'Date', 'Mailing address'],
      this.tableData,
      this.displayedColumns,
      `subscriptionReport-${new Date().toISOString()}`
    );
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
