import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { TableBaseComponent } from 'user-dashboard/shared/components';
import { PublicationResolverService } from 'user-dashboard/shared/resolvers';
import { ActionsService, IssueActionsService } from 'user-dashboard/shared/services';
import { StoreService } from 'user-dashboard/shared/state';
import { issueStatus, permissionEnum, role } from '_models';
import { Issue } from '_models/issue.model';
import { Publication } from '_models/publication.model';
import { PermissionsService } from '_services';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-issues',
  templateUrl: './issues.component.html',
  styleUrls: [
    '../../shared/components/table-base/table-base.component.scss',
    './issues.component.scss',
  ],
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'd-flex flex-column flex-fill',
  },
})
export class IssuesComponent
  extends TableBaseComponent
  implements OnInit, OnDestroy {
  publication: Publication;
  issues: Array<Issue>;
  dataSource: MatTableDataSource<Issue>;
  displayedColumns: string[] = [
    'cover',
    'name',
    'createdAt',
    // 'totalSubmissions',
    // 'totalAdvertisements',
    'status',
    'public_url',
    'menu',
  ];

  canCreateIssue: boolean;
  // baseIssueLink: string;
  // linkSuffix: string;
  canViewContributions: boolean;
  canViewAdvertisements: boolean;
  showViewerButtonValidStatus = [
    issueStatus.draftAccepted,
    issueStatus.draftSubmittedForPrintSchedule,
    issueStatus.pricingInReview,
    issueStatus.pricingConfirmed,
    issueStatus.printingDataConfirmed,
    issueStatus.issueShipped,
    issueStatus.issueDelivered,
    issueStatus.paymentSubmitted
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private actionsService: ActionsService,
    private issueActionsService: IssueActionsService,
    private publicationResolverService: PublicationResolverService,
    private permissionsService: PermissionsService,
    private storeService: StoreService
  ) {
    super();
    permissionsService.init();
  }

  ngOnInit(): void {
    this.route.data
      .pipe(take(1))
      .pipe(untilDestroyed(this))
      .subscribe((data) => {
        this.loadData(data.publication);
        if (this.route.snapshot.queryParamMap.get('newIssue') && this.canCreateIssue) {
          this.newIssue(true);
        }
      });
  }

  reload() {
    this.loading = true;
    this.clearPosParam();
    this.storeService
      .refreshPublication(this.publication.id)
      .pipe(untilDestroyed(this))
      .subscribe((data: Publication) => {
        this.loadData(data);
        console.log('Issues reloaded!');
      });
  }

  loadData(data) {
    this.publication = data;
    this.canCreateIssue = this.permissionsService.getPermission(
      permissionEnum.createIssue,
      this.publication
    );
    this.canViewContributions = this.permissionsService.getPermission(
      permissionEnum.viewContributions,
      this.publication
    );
    this.canViewAdvertisements = this.permissionsService.getPermission(
      permissionEnum.viewAdvertisements,
      this.publication
    );

    if (
      !this.canViewContributions &&
      this.displayedColumns.indexOf('totalSubmissions') !== -1
    ) {
      this.displayedColumns.splice(
        this.displayedColumns.indexOf('totalSubmissions'),
        1
      );
    }
    if (
      !this.canViewAdvertisements &&
      this.displayedColumns.indexOf('totalAdvertisements') !== -1
    ) {
      this.displayedColumns.splice(
        this.displayedColumns.indexOf('totalAdvertisements'),
        1
      );
    }
    // this.baseIssueLink = `/dashboard/publication/${this.publication.id}/issues/`;
    // this.linkSuffix = this.canCreateIssue ? '' : '/submissions';
    this.issues = data.publicationIssues;
    // console.log(this.issues);
    this.dataSource = new MatTableDataSource(this.issues);
    this.loading = false;
  }

  clearPosParam() {
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: {} });
  }

  newIssue(clearQParams = false): void {
    this.actionsService.newIssue(this.publication, {
      cb: () => {
        this.reload();
        if (clearQParams) {
          this.clearPosParam();
        }
      },
    });
  }

  onIssueMenuEvent(event) {
    console.log(event, 'Menu event!');
    if (event === 'reload') {
      // this.reload();
    }
  }

  onPublicationHeaderEvent(event) {
    console.log(event, 'Menu event!');
    if (event === 'reload') {
      this.reload();
    }
  }

  rowClick(row: Issue) {
    let navigateRoute = `issues/${ row.id }`;
    if (role.contributor === this.publication.role) {
      navigateRoute += `/submissions`;
    }
    if (role.advertiser === this.publication.role) {
      navigateRoute += '/ads';
    }
    this.router.navigate([navigateRoute], {
      relativeTo: this.route,
    });
  }

  openIssueViewer(issue, $event) {
    $event.preventDefault();
    $event.stopPropagation();
    this.issueActionsService.openPreviewIssue({
      issue: issue,
      publication: this.publication,
    });
  }

  ngOnDestroy() {
  }
}
