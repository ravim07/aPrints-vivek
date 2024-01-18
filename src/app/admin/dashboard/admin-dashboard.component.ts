import { isPlatformBrowser, Location } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, ViewChild, } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Invoice, issueStatus } from '_models';
import { Issue } from '_models/issue.model';
import { DraftService, IssueService } from '_services';
import { AlertService } from '_shared/services';
import { statuses } from './statusList';

interface SimplifiedIssue {
  id: string;
  publicationName: string;
  number: string;
  deliveryDate: Date;
  organization: string;
  status: string;
  lastUpdated: Date;
}

const lowerCaseDataAccessor = (data: any, sortHeaderId: string): string => {
  if (typeof data[sortHeaderId] === 'string') {
    return data[sortHeaderId].toLocaleLowerCase();
  }
  return data[sortHeaderId];
};

@Component({
  selector: 'admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {
  issues: Array<SimplifiedIssue>;
  invoices: Array<Invoice>;
  dataSource: MatTableDataSource<SimplifiedIssue>;
  dataSource2: MatTableDataSource<Invoice>;
  displayedColumns: string[] = [
    'publicationName',
    'name',
    // 'deliveryDate',
    'organization',
    'status',
    'lastUpdated',
    'viewIssue',
  ];
  displayedColumns2: string[] = [
    'numberId',
    'publicationName',
    'issueNumber',
    'dueDate',
    'dueStatus',
    'totalDue',
    'viewIssue',
    'downloadInvoice',
  ];

  filters = { search: '', status: '' };
  filters2 = { search: '', status: '' };
  searchFilter = new FormControl();
  searchFilter2 = new FormControl();
  statusFilter = new FormControl();
  statusFilter2 = new FormControl();

  loading = true;
  selectedIssueId = null;
  showPopupIssue = false;
  statusList = statuses;
  statusList2 = [
    { id: '', value: '' },
    { id: 'open', value: 'Open' },
    { id: 'overdue', value: 'Overdue' },
    { id: 'paid', value: 'Paid' },
  ];

  selectedTab: number;

  isBrowser = false;

  @ViewChild('downloadInvoiceLink', { static: false })
  downloadInvoiceLink;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private issueService: IssueService,
    private alertService: AlertService,
    private draftService: DraftService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.loadIssues();
  }

  @ViewChild('paginator', { static: false })
  set paginator(value: MatPaginator) {
    if (this.dataSource) {
      this.dataSource.paginator = value;
    }
  }

  @ViewChild('paginator2', { static: false })
  set paginator2(value: MatPaginator) {
    if (this.dataSource2) {
      this.dataSource2.paginator = value;
    }
  }

  @ViewChild('TableOneSort', { static: false })
  set sort(value: MatSort) {
    if (this.dataSource) {
      this.dataSource.sortingDataAccessor = lowerCaseDataAccessor;
      this.dataSource.sort = value;
    }
  }

  @ViewChild('TableTwoSort', { static: false })
  set sort2(value: MatSort) {
    if (this.dataSource2) {
      this.dataSource2.sortingDataAccessor = lowerCaseDataAccessor;
      this.dataSource2.sort = value;
    }
  }

  ngOnInit() {
    const issueId = this.route.snapshot.paramMap.get('issueId');
    this.goToIssue(issueId);
    // this.loadIssues();
  }

  customFilterPredicate() {
    const myFilterPredicate = function (
      data: SimplifiedIssue,
      filter: string
    ): boolean {
      let selectedStatusFound = true;
      const searchString = JSON.parse(filter);
      const nameFound =
        data.publicationName
          .toString()
          .trim()
          .toLowerCase()
          .indexOf(searchString.search.toLowerCase()) !== -1;
      const organizationFound =
        data.organization
          .toString()
          .trim()
          .toLowerCase()
          .indexOf(searchString.search.toLowerCase()) !== -1;
      const statusFound =
        data.status
          .toString()
          .trim()
          .toLowerCase()
          .indexOf(searchString.search.toLowerCase()) !== -1;
      if (searchString.status) {
        selectedStatusFound =
          data.status.toString().indexOf(searchString.status) !== -1;
      }
      return (
        (nameFound || organizationFound || statusFound) && selectedStatusFound
      );
    };
    return myFilterPredicate;
  }

  customFilterPredicate2() {
    const myFilterPredicate = function (
      data: Invoice,
      filter: string
    ): boolean {
      let selectedStatusFound = true;
      const searchString = JSON.parse(filter);
      const nameFound =
        data.publicationName
          .toString()
          .trim()
          .toLowerCase()
          .indexOf(searchString.search.toLowerCase()) !== -1;
      const numberFound =
        data.numberId
          .toString()
          .trim()
          .toLowerCase()
          .indexOf(searchString.search.toLowerCase()) !== -1;
      const statusFound =
        data.dueStatus
          .toString()
          .trim()
          .toLowerCase()
          .indexOf(searchString.search.toLowerCase()) !== -1;
      if (searchString.status) {
        selectedStatusFound =
          data.dueStatus.toString().indexOf(searchString.status) !== -1;
      }
      return (nameFound || numberFound || statusFound) && selectedStatusFound;
    };
    return myFilterPredicate;
  }

  loadIssues() {
    this.issueService.getIssues('all').subscribe(
      async (ret) => {
        this.loading = false;
        this.issues = ret.issues.map((o: Issue) => {
          const organizationName = o.organizationName || o.mailingAddress.organization;
          return {
            id: o.id,
            publicationName: o.publicationName.toString().trim(),
            number: o.number,
            name: o.name ? o.name : o.deliveryDate,
            deliveryDate: o.deliveryDate,
            organization: organizationName ? organizationName.toString().trim() : '',
            status: this.showStatus(o.lastStatus.statusTo).toString(),
            lastUpdated: o.lastStatus.date,
          };
        });
        this.invoices = ret.issues
          .map((o: Issue): Invoice => o.invoice)
          .filter((e: Invoice) => e && e.numberId);
        this.dataSource = new MatTableDataSource(this.issues);
        this.dataSource.filterPredicate = this.customFilterPredicate();
        this.searchFilter.valueChanges.subscribe(
          (searchFilterValue: string) => {
            this.filters.search = searchFilterValue;
            this.dataSource.filter = JSON.stringify(this.filters);
          }
        );
        this.statusFilter.valueChanges.subscribe(
          (statusFilterValue: string) => {
            this.filters.status = this.showStatus(statusFilterValue);
            this.dataSource.filter = JSON.stringify(this.filters);
          }
        );
        this.loadInvoices();
      },
      (error) => {
        this.loading = false;
        this.alertService.showAlertDangerApiError(error);
      }
    );
  }

  loadInvoices() {
    this.dataSource2 = new MatTableDataSource(this.invoices);
    this.dataSource2.filterPredicate = this.customFilterPredicate2();
    this.searchFilter2.valueChanges.subscribe((searchFilterValue: string) => {
      this.filters2.search = searchFilterValue;
      this.dataSource2.filter = JSON.stringify(this.filters2);
    });
    this.statusFilter2.valueChanges.subscribe((statusFilterValue: string) => {
      this.filters2.status = statusFilterValue;
      this.dataSource2.filter = JSON.stringify(this.filters2);
    });
  }

  // Show Status
  showStatus(status: string) {
    return issueStatus.getStatusStrAdmin(status);
  }

  // View Issie
  goToIssue(issueId: string, tab?: string) {
    this.selectedIssueId = issueId;

    if (issueId) {
      this.showPopupIssue = true;
      this.location.replaceState('/admin/issue/' + issueId);
      if (tab === 'invoice') {
        this.selectedTab = 5;
      }
    }
  }

  onPopupEvent(evt) {
    let updateIssue = false;
    if (evt.type === 'popup.closed') {
      this.selectedIssueId = null;
      this.showPopupIssue = false;
      this.location.replaceState('/admin/dashboard');
      if (evt.issue) {
        updateIssue = true;
      }
    } else if (evt.type === 'popup.issueUpdated') {
      updateIssue = true;
    }

    if (updateIssue) {
      this.loadIssues();
      // this.issues.forEach(issue => {
      //   if (issue.id === evt.issue.id) {
      //     issue.updatedAt = new Date();
      //     issue.status = evt.issue.status;
      //   }
      // });
    }
  }

  async downloadInvoice(invoiceId) {
    const invoice = await this.invoices.find((o) => o.id === invoiceId);
    const issue = this.issues.find((o) => o.id === invoice.issueId);
    if (this.isBrowser) {
      this.draftService.downloadPdf(invoice.filePublicUrl).subscribe(
        (data) => {
          const blob = new Blob([data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);

          const link = this.downloadInvoiceLink.nativeElement;
          link.href = url;
          link.download =
            `Invoice-${ issue.publicationName }#${ issue.number }` + '.pdf';
          link.click();

          window.URL.revokeObjectURL(url);
        },
        (errorData) => {
          let error = 'Error Downloading File';
          const errorApi = this.alertService.errorApiToString(errorData, '');
          if (errorApi) {
            error += ': ' + errorApi;
          }
          this.alertService.showAlertDanger(error);
        }
      );
    }
  }
}
