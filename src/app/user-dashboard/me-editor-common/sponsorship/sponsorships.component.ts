import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { TableBaseComponent } from 'user-dashboard/shared/components';
import {
  PublicationResolverService,
  SponsorshipSummaryResolverService,
} from 'user-dashboard/shared/resolvers';
import { ActionsService } from 'user-dashboard/shared/services';
import { DonationSummaryItem } from '_models';
import { DonationSummary } from '_models/donation-summary.model';
import { Publication } from '_models/publication.model';

interface DonationSummaryEntryData {
  publication: Publication;
  sponsorshipSummary: DonationSummary;
}

@Component({
  selector: 'app-sponsorships',
  templateUrl: './sponsorships.component.html',
  styleUrls: [
    '../../shared/components/table-base/table-base.component.scss',
    './sponsorships.component.scss',
  ],
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'd-flex flex-column flex-fill',
  },
})
export class SponsorshipsComponent
  extends TableBaseComponent
  implements OnInit, OnDestroy {
  publication: Publication;
  sponsorshipSummary: DonationSummary;
  donationLevels: Array<DonationSummaryItem>;
  totalAmount: number;
  sponsorsCount: number;
  dataSource: MatTableDataSource<DonationSummaryItem>;
  displayedColumns: string[] = [
    'name',
    'amount',
    'sponsorsCount',
    'totalAmount',
  ];
  constructor(
    private route: ActivatedRoute,
    private publicationResolverService: PublicationResolverService,
    private sponsorshipsResolverService: SponsorshipSummaryResolverService,
    private actionsService: ActionsService
  ) {
    super();
  }

  ngOnInit(): void {
    this.route.data
      .pipe(untilDestroyed(this))
      .subscribe((data: DonationSummaryEntryData) => {
        this.loadData(data);
      });
  }

  loadData(data: DonationSummaryEntryData) {
    this.publication = data.publication;
    this.sponsorshipSummary = data.sponsorshipSummary;
    console.log(this.sponsorshipSummary);
    this.totalAmount = data.sponsorshipSummary.totalAmount;
    this.sponsorsCount = data.sponsorshipSummary.sponsorsCount;
    this.donationLevels = data.sponsorshipSummary.perLevel.map(
      (o: any | DonationSummaryItem) => {
        o = { ...o, ...o.donationLevel };
        return o;
      }
    );
    this.dataSource = new MatTableDataSource(this.donationLevels);
    this.loading = false;
  }

  reload() {
    this.loading = true;
    this.publicationResolverService
      .resolve2(this.publication.id)
      .pipe(untilDestroyed(this))
      .subscribe((pub) => {
        this.sponsorshipsResolverService
          .resolve2(this.publication.id)
          .pipe(untilDestroyed(this))
          .subscribe((sponsorshipSummary) => {
            this.loadData({
              publication: pub,
              sponsorshipSummary: sponsorshipSummary,
            });
            console.log('Sponsorships reloaded!');
          });
      });
  }

  addSponsors() {
    this.actionsService.addSponsor(this.publication, {
      cb: () => {
        console.log('addSponsor closed!');
        this.reload();
      },
    });
  }

  manageSponsorshipLevels() {
    this.actionsService.manageSponsorshipLevels(
      this.publication,
      this.sponsorshipSummary,
      {
        cb: () => this.reload(),
      }
    );
  }

  report() {
    this.actionsService.sponsorshipReport(this.publication, {
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
