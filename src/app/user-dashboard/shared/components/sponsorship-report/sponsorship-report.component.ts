import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ExportCsvService } from 'user-dashboard/shared/services';
import { DonationSummary } from '_models/donation-summary.model';
import { Donation } from '_models/donation.model';
import { Publication } from '_models/publication.model';
import { TableBaseComponent } from '../table-base/table-base.component';

@Component({
  selector: 'app-sponsorship-report',
  templateUrl: './sponsorship-report.component.html',
})
export class SponsorshipsReportComponent extends TableBaseComponent {
  publication: Publication;
  donations: {
    donations: Donation[];
    summary: DonationSummary;
  };
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
    'Sponsorship',
    'Amount',
    'Name',
    'Email',
    'Date',
    'Mailing address',
  ];
  active = true;
  tableData = [];

  constructor(
    public dialogRef: MatDialogRef<SponsorshipsReportComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    public exportCsvService: ExportCsvService
  ) {
    super();
    this.publication = data.publication;
    this.donations = data.donations;
    this.loadData();
  }

  loadData() {
    this.tableData = this.donations.donations.map((item) => {
      return {
        name: item.donationLevelDetails.name,
        amount: item.amount,
        sponsorName: item.sponsor.name,
        sponsorEmail: item.sponsor.email,
        createdAt: item.createdAt,
        mailingAddress:
          `${item.sponsor.mailingAddress.address1}` +
          `${
            item.sponsor.mailingAddress.address2
              ? ' ' + item.sponsor.mailingAddress.address2
              : ''
          }` +
          `, ${item.sponsor.mailingAddress.city}, ` +
          `${item.sponsor.mailingAddress.state} ` +
          `${item.sponsor.mailingAddress.zip}`,
      };
    });
    this.dataSource = new MatTableDataSource(this.tableData);
  }

  downloadCsv() {
    this.exportCsvService.csvDownload(
      this.csvHeaders,
      this.tableData,
      this.displayedColumns,
      `sponsorshipReport-${new Date().toISOString()}`
    );
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
