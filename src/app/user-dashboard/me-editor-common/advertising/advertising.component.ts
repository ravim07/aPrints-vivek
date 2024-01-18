import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { TableBaseComponent } from 'user-dashboard/shared/components';
import { AdvertisingSummaryResolverService } from 'user-dashboard/shared/resolvers/advertising-summary-resolver.service';
import { PublicationResolverService } from 'user-dashboard/shared/resolvers/publication-resolver.service';
import { ActionsService } from 'user-dashboard/shared/services';
import {
  AdvertisingSummary,
  AdvertisingSummaryEntryData,
  AdvertisingSummaryPerTypeItem,
} from '_models/advertising-summary.model';
import { Publication } from '_models/publication.model';

@Component({
  selector: 'app-advertising',
  templateUrl: './advertising.component.html',
  styleUrls: [
    '../../shared/components/table-base/table-base.component.scss',
    './advertising.component.scss',
  ],
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'd-flex flex-column flex-fill',
  },
})
export class AdvertisingComponent
  extends TableBaseComponent
  implements OnInit, OnDestroy {
  publication: Publication;
  advertisingSummary: AdvertisingSummary;
  adTypes: AdvertisingSummaryPerTypeItem[];
  totalAmount: number;
  advertisersCount: number;
  dataSource: MatTableDataSource<AdvertisingSummaryPerTypeItem>;
  displayedColumns: string[];
  constructor(
    private route: ActivatedRoute,
    private publicationResolverService: PublicationResolverService,
    private advertisingResolverService: AdvertisingSummaryResolverService,
    private actionsService: ActionsService
  ) {
    super();
  }

  ngOnInit(): void {
    this.route.data
      .pipe(untilDestroyed(this))
      .subscribe((data: AdvertisingSummaryEntryData) => {
        this.loadData(data);
      });
  }

  loadData(data: AdvertisingSummaryEntryData) {
    this.publication = data.publication;
    this.advertisingSummary = data.advertisingSummary;
    console.log(data.advertisingSummary);
    this.totalAmount = data.advertisingSummary.totalAmount;
    this.advertisersCount = data.advertisingSummary.advertisersCount;
    this.adTypes = data.advertisingSummary.perTypeArr;
    this.displayedColumns = data.advertisingSummary.displayedColumns;
    this.dataSource = new MatTableDataSource(this.adTypes);
    this.loading = false;
  }

  reload() {
    this.loading = true;
    this.publicationResolverService
      .resolve2(this.publication.id)
      .pipe(untilDestroyed(this))
      .subscribe((pub) => {
        this.advertisingResolverService
          .resolve2(this.publication.id)
          .pipe(untilDestroyed(this))
          .subscribe((advertisingSummary) => {
            this.loadData({
              publication: pub,
              advertisingSummary: advertisingSummary,
            });
            console.log('Subscriptions reloaded!');
          });
      });
  }

  addAdvertisers() {
    this.actionsService.addAdvertiser(this.publication, {
      cb: () => {
        console.log('addAdvertiser closed!');
        this.reload();
      },
    });
  }

  manageAdRateSheet() {
    this.actionsService.manageAdRateSheet(this.publication, {
      cb: () => this.reload(),
    });
  }

  report() {
    this.actionsService.advertisingReport(this.publication, {
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
