import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { TableBaseComponent } from 'user-dashboard/shared/components';
import {
  PublicationResolverService,
  SubscriptionSummaryResolverService,
} from 'user-dashboard/shared/resolvers';
import { ActionsService } from 'user-dashboard/shared/services';
import { StoreService } from 'user-dashboard/shared/state';
import { SubscriptionSummaryItem } from '_models';
import { Publication } from '_models/publication.model';
import { SubscriptionSummary } from '_models/subscription-summary.model';

interface SubscriptionSummaryEntryData {
  publication: Publication;
  subscriptionSummary: SubscriptionSummary;
}

@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: [
    '../../shared/components/table-base/table-base.component.scss',
    './subscriptions.component.scss',
  ],
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'd-flex flex-column flex-fill',
  },
})
export class SubscriptionsComponent
  extends TableBaseComponent
  implements OnInit, OnDestroy {
  publication: Publication;
  subscriptionSummary: SubscriptionSummary;
  subscriptionTypes: Array<SubscriptionSummaryItem | any>;
  totalAmount: number;
  subscribersCount: number;
  dataSource: MatTableDataSource<SubscriptionSummaryItem>;
  displayedColumns: string[] = [
    'name',
    'amount',
    'subscribersCount',
    'totalAmount',
  ];
  constructor(
    private route: ActivatedRoute,
    private publicationResolverService: PublicationResolverService,
    private subscriptionsResolverService: SubscriptionSummaryResolverService,
    private actionsService: ActionsService,
    public storeService: StoreService
  ) {
    super();
  }

  ngOnInit(): void {
    this.route.data
      .pipe(untilDestroyed(this))
      .subscribe((data: SubscriptionSummaryEntryData) => {
        this.loadData(data);
      });
  }

  loadData(data: SubscriptionSummaryEntryData) {
    this.publication = data.publication;
    this.subscriptionSummary = data.subscriptionSummary;
    this.totalAmount = data.subscriptionSummary.totalAmount;
    this.subscribersCount = data.subscriptionSummary.subscribersCount;
    this.subscriptionTypes = data.subscriptionSummary.perType.map(
      (o: any | SubscriptionSummaryItem) => {
        o = { ...o, ...o.subscriptionType };
        // if (o.subscribersCount > 0) {
        //   return o;
        // }
        return o;
      }
    );
    console.log(this.subscriptionTypes);
    // TODO: Temporal removal of Self Managed type
    this.subscriptionTypes = this.subscriptionTypes.filter(
      (o) => o.name !== 'Self Managed'
    );
    console.log(this.subscriptionTypes);
    this.dataSource = new MatTableDataSource(this.subscriptionTypes);
    this.loading = false;
  }

  reload() {
    this.loading = true;
    this.storeService
      .refreshPublication(this.publication.id)
      .pipe(untilDestroyed(this))
      .subscribe((pub) => {
        this.subscriptionsResolverService
          .resolve2(this.publication.id)
          .pipe(untilDestroyed(this))
          .subscribe((subscriptionSummary) => {
            this.loadData({
              publication: pub,
              subscriptionSummary: subscriptionSummary,
            });
            console.log('Subscriptions reloaded!');
          });
      });
  }

  addSubscribers() {
    this.actionsService.addSubscriber(this.publication, {
      cb: () => {
        console.log('addSubscriber closed!');
        this.reload();
      },
    });
  }

  manageSubscriptionTypes() {
    this.actionsService.manageSubscriptionTypes(
      this.publication,
      this.subscriptionSummary,
      {
        cb: () => this.reload(),
      }
    );
  }

  report() {
    this.actionsService.subscriptionsReport(this.publication, {
      cb: () => this.reload(),
    });
  }

  onPublicationHeaderEvent(event) {
    console.log(event, 'Menu event!');
    if (event === 'reload') {
      // this.reload();
    }
  }
  ngOnDestroy(): void {}
}
