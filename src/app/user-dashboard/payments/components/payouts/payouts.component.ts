import { Component, OnDestroy, OnInit } from '@angular/core';
import { Publication } from '_models/publication.model';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { BankAccountDialogComponent } from 'user-dashboard/payments/modals/bank-account-dialog/bank-account-dialog.component';
import { TransferFundsDialogComponent } from 'user-dashboard/payments/modals/transfer-funds-dialog/transfer-funds-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionsService, PublicationUrlService } from 'user-dashboard/shared/services';
import { PaymentService, PublicationService } from '_services';
import { StoreService } from 'user-dashboard/shared/state';
import { LoadingService } from '_services/loading.service';
import { AlertService } from '_shared/services';
import { TransferService } from 'user-dashboard/payments/services/transfer.service';

@Component({
  selector: 'app-payouts',
  templateUrl: './payouts.component.html',
  styleUrls: ['./payouts.component.scss']
})
export class PayoutsComponent implements OnInit, OnDestroy {
  publication: Publication;
  issueId: string;
  loading = true;
  tab = 'none';
  dataSource: MatTableDataSource<any>;

  tableColumns = [
    'bankName',
    'description',
    'last4',
    'type',
    'amount',
    'fee',
    'netAmount',
  ];

  stripeAccount: any;
  donations;
  payOuts;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private publicationUrlService: PublicationUrlService,
              private dialog: MatDialog,
              private paymentService: PaymentService,
              private actionsService: ActionsService,
              private storeService: StoreService,
              private loadingService: LoadingService,
              private alertService: AlertService,
              private transferService: TransferService,
              private publicationService: PublicationService) {
  }

  ngOnInit() {

    this.route.parent.data
      .pipe(untilDestroyed(this))
      .subscribe(data => {
        console.log(data);
        this.loadData(data);
        this.loading = false;
        /*
              this.route.queryParams
                .subscribe(params => {
                  if (params['tab']) {
                    this.tab = params['tab'];
                  }
                });
        */
      });

    this.transferService.addBankAccountEvent
      .pipe(untilDestroyed(this))
      .subscribe(() => this.addBankAccount());
    this.transferService.transferFundsEvent
      .pipe(untilDestroyed(this))
      .subscribe(() => this.transfersFunds());
  }


  getStripeAccount() {
    this.publicationService.getStripeAccount(this.publication.id).subscribe(stripeAccount => {
      this.stripeAccount = stripeAccount;
      this.transferService.setStripeAccount(stripeAccount);
    });
  }

  getPayOuts() {
    this.publicationService.getPayOuts(this.publication.id)
      .subscribe(data => {
        if (data && data.length) {
          this.payOuts = data;
          this.dataSource = new MatTableDataSource<any>(data);
        }
      });
  }

  loadData(data) {
    this.loading = false;
    this.publication = data.publication;
    this.getStripeAccount();
    this.getPayOuts();
  }

  reload() {
    this.loading = true;
    this.storeService
      .refreshPublication(this.publication.id)
      .pipe(untilDestroyed(this))
      .subscribe((data: Publication) => {
        this.loadData({
          publication: data
        });
      });
  }


  addBankAccount() {
    this.dialog.open(BankAccountDialogComponent, {
      panelClass: ['flat-dialog', 'normal', 'height-1100', 'width-700', 'mobile-support'],
      data: {
        publicationId: this.publication.id
      }
    }).beforeClosed().subscribe((data) => {
      if (!data) {
        return;
      }
      this.reload();
    });
  }

  transfersFunds() {
    this.dialog.open(TransferFundsDialogComponent, {
      panelClass: [
        'flat-dialog',
        'normal',
        'height-700',
        'width-550',
        'mobile-support'
      ],
      data: {
        publicationId: this.publication.id
      }
    }).beforeClosed().subscribe((result) => {
      if (result) {
        this.reload();
        this.transferService.transferComplete();
      }
    });
  }

  ngOnDestroy() {
  }

}
