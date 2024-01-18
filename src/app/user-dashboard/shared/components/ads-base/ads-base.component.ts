import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { IssueResolverService, PublicationResolverService, } from 'user-dashboard/shared/resolvers';
import { StoreService } from 'user-dashboard/shared/state';
import { Draft, permissionEnum } from '_models';
import { Issue } from '_models/issue.model';
import { Publication } from '_models/publication.model';
import { PermissionsService } from '_services';
import { AdvertisementsActionsService } from 'user-dashboard/shared/services/advertisements-actions.service';

@Component({
  selector: 'app-ads-base',
  templateUrl: './ads-base.component.html',
  styleUrls: ['./ads-base.component.scss'],
  host: {
    class: 'd-flex flex-column flex-fill',
  },
})
export class AdsBaseComponent implements OnInit, OnDestroy {
  publication: Publication;
  issue: Issue;
  draft?: Draft;
  fileUploaderEvent;
  openDialogUploadFile = false;
  canManageAdvertisers = true;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public publicationResolverService: PublicationResolverService,
    public issueResolverService: IssueResolverService,
    public advertisementsActionsService: AdvertisementsActionsService,
    public permissionsService: PermissionsService,
    public storeService: StoreService
  ) {
  }

  ngOnInit(): void {
    this.storeService
      .currentPublicationIssueAdvertisements()
      .pipe(untilDestroyed(this))
      .subscribe((data) => {
        this.canManageAdvertisers = this.permissionsService.getPermission(
          permissionEnum.manageAdvertisers,
          data.publication
        );
        const advertisements = this.canManageAdvertisers
          ? data.issue.advertisements
          : data.advertisements;
        this.loadData({
          issue: data.issue,
          publication: data.publication,
          advertisements: advertisements,
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
            this.loadData({issue: issue, publication: pub, advertisements: {}});
            console.log('Issue reloaded!');
          });
      });
  }

  loadData({issue, publication, advertisements}) {
    this.issue = issue;
    this.draft = this.issue.getCurrentDraft();
    this.publication = publication;
    console.log(this.issue, this.draft);
  }

  newArticle() {
    this.advertisementsActionsService.newArticle(
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
      }, 0);
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
