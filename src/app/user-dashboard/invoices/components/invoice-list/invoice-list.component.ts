import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { Publication } from '_models/publication.model';
import { PublicationService } from '_services';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Invoice } from '_models';

@Component({
  selector: 'app-invoices-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: [
    '../../../shared/components/table-base/table-base.component.scss',
    './invoice-list.component.scss'
  ],
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'd-flex flex-column flex-fill',
  },
})
export class InvoiceListComponent implements OnInit, OnDestroy, AfterViewInit {
  publication: Publication;
  loading: boolean;
  dataSource: MatTableDataSource<Invoice>;
  tableColumns = ['issue',
    'flatAmount',
    // 'chargeAmount',
    'createdAt',
    'dueDate',
    'status',
    'actions'
  ];
  invoices: Invoice[];
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  constructor(private route: ActivatedRoute, private publicationService: PublicationService) {
  }

  ngAfterViewInit() {
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.route.data
      .pipe(untilDestroyed(this))
      .subscribe(data => {
        this.loading = false;
        this.publication = data.publication;
        this.invoices = data.invoices;
        this.dataSource = new MatTableDataSource<Invoice>(data.invoices);
        this.dataSource.paginator = this.paginator;
        // this.dataSource.sort = this.sort;
      });

  }

  refresh() {
    this.loading = true;
    this.publicationService.getInvoices(this.publication.id).subscribe((invoices) => {
      this.loading = false;
      this.invoices = invoices;
      this.dataSource = new MatTableDataSource<Invoice>(invoices);
      this.dataSource.paginator = this.paginator;
    });

  }

  ngOnDestroy() {
  }

}
