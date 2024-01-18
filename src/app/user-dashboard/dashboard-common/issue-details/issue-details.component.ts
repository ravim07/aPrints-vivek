import { Component, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IssueBaseComponent } from 'user-dashboard/shared/components';
import { IssueResolverService, PublicationResolverService, } from 'user-dashboard/shared/resolvers';
import { SubmissionsActionsService } from 'user-dashboard/shared/services';
import { StoreService } from 'user-dashboard/shared/state';
import { PermissionsService } from '_services';
import { UploadFileComponent } from '_shared/components';
import { isPlatformBrowser } from '@angular/common';
import { PdfViewerService } from '_shared/services';

@Component({
  selector: 'app-issue-details',
  templateUrl: './issue-details.component.html',
  styleUrls: [
    '../../shared/components/issue-base/issue-base.component.scss',
    './issue-details.component.scss',
  ],
  host: {
    class: 'd-flex flex-column flex-fill',
  },
})
export class IssueDetailsComponent extends IssueBaseComponent {
  @ViewChild('uploadComponent', { static: false })
  uploadComponent: UploadFileComponent;
  isBrowser;

  constructor(
    route: ActivatedRoute,
    router: Router,
    publicationResolverService: PublicationResolverService,
    issueResolverService: IssueResolverService,
    submissionsActionsService: SubmissionsActionsService,
    permissionsService: PermissionsService,
    private pdfViewerService: PdfViewerService,
    storeService: StoreService,
    @Inject(PLATFORM_ID) private platformId: Object,
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
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  onFileDropped(files: FileList) {
    this.uploadComponent.onChangeUploadFile(files);
  }

  viewPdfEvent($event) {
    const downloadUrl = this.issue.coverImage.fileUrl && this.issue.coverImage.fileUrl ? this.issue.coverImage.fileUrl : this.draft.filePublicUrl;

    this.pdfViewerService.showPdf({
      downloadUrl,
      fileUrl: this.draft.filePublicUrl
    });
  }
}
