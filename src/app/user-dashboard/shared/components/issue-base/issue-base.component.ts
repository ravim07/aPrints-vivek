import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { IssueResolverService, PublicationResolverService, } from 'user-dashboard/shared/resolvers';
import { SubmissionsActionsService } from 'user-dashboard/shared/services';
import { StoreService } from 'user-dashboard/shared/state';
import { Draft, permissionEnum } from '_models';
import { Issue } from '_models/issue.model';
import { Publication } from '_models/publication.model';
import { PermissionsService } from '_services';
import { PdfViewerService } from '_shared/services';

@Component({
  selector: 'app-issue-base',
  templateUrl: './issue-base.component.html',
  styleUrls: ['./issue-base.component.scss'],
  host: {
    class: 'd-flex flex-column flex-fill',
  },
})
export class IssueBaseComponent implements OnInit, OnDestroy {
  publication: Publication;
  issue: Issue;
  draft?: Draft;
  fileUploaderEvent;
  openDialogUploadFile = false;
  canManageContributions: boolean;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public publicationResolverService: PublicationResolverService,
    public issueResolverService: IssueResolverService,
    public submissionsActionsService: SubmissionsActionsService,
    public permissionsService: PermissionsService,
    public storeService: StoreService
  ) {
  }

  ngOnInit(): void {
    this.storeService
      .currentPublicationIssueSubmissions()
      .pipe(untilDestroyed(this))
      .subscribe((data) => {
        this.canManageContributions = this.permissionsService.getPermission(
          permissionEnum.manageContributors,
          data.publication
        );
        const submissions = this.canManageContributions
          ? data.issue.contributions
          : data.submissions;
        this.loadData({
          issue: data.issue,
          publication: data.publication,
          submissions: submissions,
        });
      });
  }

  reload() {
    this.storeService
      .refreshPublication(this.publication.id)
      .pipe(untilDestroyed(this))
      .subscribe((pub) => {
        this.storeService
          .refreshIssue(this.issue.id)
          .pipe(untilDestroyed(this))
          .subscribe((issue) => {
            this.loadData({ issue: issue, publication: pub, submissions: {} });
            console.log('Issue reloaded!');
          });
      });
  }

  loadData({ issue, publication, submissions }) {
    this.issue = issue;
    this.draft = this.issue.getCurrentDraft();
    this.publication = publication;
    console.log(this.issue, this.draft);
  }

  newArticle() {
    this.submissionsActionsService.newArticle(
      this.router,
      this.publication,
      this.issue
    );
  }

  onEvent(event) {
    console.log(event, 'Event!');
    if (event === 'reload') {
      this.reload();
    } else if (event === 'openUploadDialog') {
      this.openDialogUploadFile = false;
      setTimeout(() => {
        this.openDialogUploadFile = true;
      }, 250);
    } else if (event === 'closeUploadDialog') {
      this.openDialogUploadFile = false;
    }
  }

  onFileUploaderEvent(evt: any) {
    this.fileUploaderEvent = evt;
  }

  ngOnDestroy() {
  }
}
