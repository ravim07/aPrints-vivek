import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { TransferService } from 'user-dashboard/payments/services/transfer.service';
import { Publication } from '_models/publication.model';
import { StoreService } from 'user-dashboard/shared/state';

@Component({
  selector: 'app-transfers',
  templateUrl: './transfers.component.html',
  styleUrls: [
    '../../../shared/components/table-base/table-base.component.scss',
    './transfers.component.scss'
  ],
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'd-flex flex-column flex-fill',
  },
  providers: [TransferService]
})
export class TransfersComponent implements OnInit, OnDestroy {
  publication;
  stripeAccount;
  loading: boolean;
  showActions = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storeService: StoreService,
    private transferService: TransferService,
  ) {
  }

  ngOnInit() {
    this.loading = true;
    this.route.data
      .pipe(untilDestroyed(this)).subscribe(data => {
      this.loadData(data);
      this.loading = false;
    });

    this.transferService.getStripeAccount()
      .pipe(untilDestroyed(this))
      .subscribe((data) => {
        this.stripeAccount = data;
      });


    this.transferService.onTransferComplete.subscribe(() => {
      this.reload();
    });
  }

  loadData(data) {
    this.loading = false;
    this.publication = data.publication;
  }

  addBankAccount() {
    this.transferService.addBankAccountEvent.emit();
  }

  transfersFunds() {
    this.transferService.transferFundsEvent.emit();
  }

  reload() {
    this.storeService
      .refreshPublication(this.publication.id)
      .pipe(untilDestroyed(this))
      .subscribe((data: Publication) => {
        this.loadData({
          publication: data
        });
      });
  }

  ngOnDestroy() {
  }
}
