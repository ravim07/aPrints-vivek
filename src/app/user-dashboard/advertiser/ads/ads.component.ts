import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { AdsBaseComponent, lowerCaseDataAccessor, } from 'user-dashboard/shared/components';
import { IssueResolverService, PublicationResolverService, SubmissionsResolverService, } from 'user-dashboard/shared/resolvers';
import { StoreService } from 'user-dashboard/shared/state';
import { Draft, permissionEnum } from '_models';
import { PermissionsService } from '_services';
import { AdResource } from '_models/ad-resource.model';
import { AdvertisementsActionsService } from 'user-dashboard/shared/services/advertisements-actions.service';

@Component({
  selector: 'app-ads',
  templateUrl: './ads.component.html',
  styleUrls: [
    '../../shared/components/table-base/table-base.component.scss',
    '../../shared/components/ads-base/ads-base.component.scss',
    './ads.component.scss',
  ],
  host: {
    class: 'd-flex flex-column flex-fill',
  },
  encapsulation: ViewEncapsulation.None,
})
export class AdsComponent extends AdsBaseComponent {
  dataSource: MatTableDataSource<any>;
  draft: Draft;
  availableColumns: string[] = [
    'title',
    'author',
    'createdAt',
    'updatedAt',
    'commentsNumber',
    'menu',
  ];
  displayedColumns: string[] = [];

  ads: AdResource[];
  canAdvertise: boolean;

  constructor(
    route: ActivatedRoute,
    router: Router,
    publicationResolverService: PublicationResolverService,
    issueResolverService: IssueResolverService,
    private submissionsResolverService: SubmissionsResolverService,
    advertisementsActionsService: AdvertisementsActionsService,
    permissionsService: PermissionsService,
    storeService: StoreService
  ) {
    super(
      route,
      router,
      publicationResolverService,
      issueResolverService,
      advertisementsActionsService,
      permissionsService,
      storeService
    );
  }

  @ViewChild('paginator', {static: false})
  set paginator(value: MatPaginator) {
    if (this.dataSource) {
      this.dataSource.paginator = value;
    }
  }

  @ViewChild('TableSort', {static: false})
  set sort(value: MatSort) {
    if (this.dataSource) {
      this.dataSource.sortingDataAccessor = lowerCaseDataAccessor;
      this.dataSource.sort = value;
    }
  }

  reload() {
    this.storeService
      .refreshPublication(this.publication.id)
      .pipe(untilDestroyed(this))
      .subscribe((pub) => {
        this.canManageAdvertisers = this.permissionsService.getPermission(
          permissionEnum.manageAdvertisers,
          pub
        );
        this.storeService
          .refreshIssue(this.issue.id)
          .pipe(untilDestroyed(this))
          .subscribe((issue) => {
            console.log(issue);
            this.storeService
              .refreshAdvertisementList(this.issue.id)
              .pipe(untilDestroyed(this))
              .subscribe((articles) => {
                console.log(issue, articles);
                const advertisements = this.canManageAdvertisers
                  ? issue.advertisements
                  : articles;
                this.loadData({
                  issue: issue,
                  publication: pub,
                  advertisements: advertisements,
                });
                console.log('Issue reloaded!');
              });
          });
      });
  }

  loadData({issue, publication, advertisements}) {
    this.issue = issue;
    this.draft = this.issue.getCurrentDraft();
    this.publication = publication;
    this.initTable({advertisements: advertisements});
    this.canAdvertise = this.issue.canAdvertise();
    // console.log(this.issue, this.draft, this.submissions);
  }

  initTable({advertisements}) {
    this.ads = advertisements;
    this.clearPosParam();
    if (this.ads) {
      const availableColumns = [...this.availableColumns];
      if (!this.canManageAdvertisers) { availableColumns.splice(1, 1); }
      this.displayedColumns = availableColumns;
      this.dataSource = new MatTableDataSource(this.ads);
    }
  }

  clearPosParam() {
    this.router.navigate(['.'], {relativeTo: this.route, queryParams: {}});
  }

  deleteArticle(advertisement: AdResource) {
    this.advertisementsActionsService.deleteArticle(advertisement, {
      cb: () => this.reload(),
    });
  }

  rowClick(row: AdResource) {
    this.router.navigate([row.id], {relativeTo: this.route});
  }

  newAd() {
    this.router.navigate(['new'], {relativeTo: this.route});
  }
}
