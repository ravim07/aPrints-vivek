import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { IssueBaseComponent, lowerCaseDataAccessor, } from 'user-dashboard/shared/components';
import { IssueResolverService, PublicationResolverService, SubmissionsResolverService, } from 'user-dashboard/shared/resolvers';
import { SubmissionsActionsService } from 'user-dashboard/shared/services';
import { StoreService } from 'user-dashboard/shared/state';
import { Draft, permissionEnum } from '_models';
import { Contribution } from '_models/contribution.model';
import { PermissionsService } from '_services';

@Component({
  selector: 'app-submissions',
  templateUrl: './submissions.component.html',
  styleUrls: [
    '../../shared/components/table-base/table-base.component.scss',
    '../../shared/components/issue-base/issue-base.component.scss',
    './submissions.component.scss',
  ],
  host: {
    class: 'd-flex flex-column flex-fill',
  },
  encapsulation: ViewEncapsulation.None,
})
export class SubmissionsComponent extends IssueBaseComponent {
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

  submissions: Contribution[];
  canContribute: boolean;

  constructor(
    route: ActivatedRoute,
    router: Router,
    publicationResolverService: PublicationResolverService,
    issueResolverService: IssueResolverService,
    private submissionsResolverService: SubmissionsResolverService,
    submissionsActionsService: SubmissionsActionsService,
    permissionsService: PermissionsService,
    storeService: StoreService
  ) {
    super(
      route,
      router,
      publicationResolverService,
      issueResolverService,
      submissionsActionsService,
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
        this.canManageContributions = this.permissionsService.getPermission(
          permissionEnum.manageContributors,
          pub
        );
        this.storeService
          .refreshIssue(this.issue.id)
          .pipe(untilDestroyed(this))
          .subscribe((issue) => {
            this.storeService
              .refreshSubmissionList(this.issue.id)
              .pipe(untilDestroyed(this))
              .subscribe((articles) => {
                const submissions = this.canManageContributions
                  ? issue.contributions
                  : articles;
                this.loadData({
                  issue: issue,
                  publication: pub,
                  submissions: submissions,
                });
                console.log('Issue reloaded!');
              });
          });
      });
  }

  loadData({issue, publication, submissions}) {
    this.issue = issue;
    this.draft = this.issue.getCurrentDraft();
    this.publication = publication;
    this.initTable({contributions: submissions});
    this.canContribute = this.issue.canContribute();
    // console.log(this.issue, this.draft, this.submissions);
  }

  initTable({contributions}) {
    this.submissions = contributions;
    this.clearPosParam();
    if (this.submissions) {
      const availableColumns = [...this.availableColumns];
      if (!this.canManageContributions) {
        availableColumns.splice(1, 1);
      }
      this.displayedColumns = availableColumns;
      this.dataSource = new MatTableDataSource(this.submissions);
    }
  }

  clearPosParam() {
    this.router.navigate(['.'], {relativeTo: this.route, queryParams: {}});
  }

  deleteArticle(contribution: Contribution) {
    this.submissionsActionsService.deleteArticle(contribution, {
      cb: () => this.reload(),
    });
  }

  rowClick(row: Contribution) {
    this.router.navigate([
      `/dashboard/publication/${this.publication.id}/issues/${this.issue.id}/submissions/${row.id}`,
    ]);
  }
}
