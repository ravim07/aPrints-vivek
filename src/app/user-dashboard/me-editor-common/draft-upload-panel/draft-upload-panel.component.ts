import { isPlatformBrowser } from '@angular/common';
import { HttpBackend, HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  Output,
  PLATFORM_ID,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { environment } from 'environments/environment';
import { zip } from 'rxjs';
import { map } from 'rxjs/operators';
import { DraftBaseComponent } from 'user-dashboard/shared/components';
import { IssueActionsService } from 'user-dashboard/shared/services';
import { StoreService } from 'user-dashboard/shared/state';
import { DraftService, PermissionsService } from '_services';
import { AlertService } from '_shared/services';
import { issueStatus } from '_models/issue-status.model';

@Component({
  selector: 'app-draft-upload-panel',
  templateUrl: './draft-upload-panel.component.html',
  styleUrls: ['./draft-upload-panel.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DraftUploadPanelComponent extends DraftBaseComponent {
  isBrowser = false;
  pdfFolder = `${ environment.assetsUrl }/template-pdfs/`;
  inProgress = false;
  inProgressLabel = 'Uploading ...';
  inProgressBarWidthStyle = '0%';
  showPopupPdfViewer;
  @ViewChild('downloadPdfLink', { static: false }) downloadPdfLink;
  clickedCover;
  @Output() fileDropped = new EventEmitter<FileList>();
  issueStatusDef = issueStatus;
  @Output()
  viewPdfEvent: EventEmitter<any> = new EventEmitter<any>();
  showViewerButtonValidStatus = [
    issueStatus.draftAccepted,
    issueStatus.draftSubmittedForPrintSchedule,
    issueStatus.pricingInReview,
    issueStatus.pricingConfirmed,
    issueStatus.printingDataConfirmed,
    issueStatus.issueShipped,
    issueStatus.issueDelivered,
    issueStatus.paymentSubmitted,
  ];
  private http: HttpClient;

  constructor(
    issueActionsService: IssueActionsService,
    private draftService: DraftService,
    private alertService: AlertService,
    permissionsService: PermissionsService,
    handler: HttpBackend,
    @Inject(PLATFORM_ID) private platformId: Object,
    public storeService: StoreService
  ) {
    super(issueActionsService, permissionsService);
    this.http = new HttpClient(handler);
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  @Input('fileUploaderEvent')
  set fileUploaderEvent(evt: any) {
    if (evt) {
      switch (evt.type) {
        case 'uploader.uploadStarted':
          this.inProgressLabel = 'Uploading ...';
          this.inProgressBarWidthStyle = '10%';
          this.inProgress = true;
          break;
        case 'uploader.uploadProgress':
          this.inProgressLabel = 'Uploading ...';
          this.inProgressBarWidthStyle = '25%';
          if (evt.percentage === 100) {
            this.inProgressBarWidthStyle = '50%';
            this.inProgressLabel = 'Processing file...';
          }
          break;
        case 'uploader.onUploadError':
        case 'uploader.draftError':
        case 'uploader.thumbnailError':
          this.alertService.showAlertDanger(evt.error);
          this.reload();
          this.inProgress = false;
          break;
        case 'uploader.generatingThumbnail':
          this.inProgressBarWidthStyle = '75%';
          this.inProgressLabel = 'Generating cover image...';
          break;
        case 'uploader.thumbnailGenerated':
          this.inProgressBarWidthStyle = '100%';
          this.inProgressLabel = 'Cover image created!';
          break;
        case 'uploader.creatingDraft':
          this.inProgressLabel = 'Creating draft...';
          break;
        case 'uploader.draftCreated':
          this.alertService.showAlertSuccess('PDF uploaded successfully.');
          this.reload();
          this.inProgress = false;
          break;
      }
    }
  }

  reload() {
    this.triggerReload.emit(this.defaultTriggerAndCb.trigger.event);
    this.defaultTriggerAndCb.cb();
    zip(
      this.storeService.refreshPublication(this.publication.id),
      this.storeService.refreshIssue(this.issue.id),
      this.storeService.refreshPublicationList()
    )
      .pipe(
        map(([publication, issue, pubList]) => {
          return { publication, issue, pubList };
        })
      )
      .subscribe((data) => {
        console.log('everything reloaded! :)', data);
      });
  }

  openPdfViewer() {
  }

  replacePdf() {
    this.issueActionsService.cancelReview({
      draftId: this.draft.id,
      publication: this.publication,
      issue: this.issue,
      options: this.defaultTriggerAndCb,
      upload: true,
    });
  }

  reuploadDraft() {
    this.issueActionsService.reuploadDraft({
      draftId: this.draft.id,
      publication: this.publication,
      issue: this.issue,
      options: this.defaultTriggerAndCb,
      upload: true,
    });
  }

  cancelReview() {
    this.issueActionsService.cancelReview({
      draftId: this.draft.id,
      publication: this.publication,
      issue: this.issue,
      options: this.defaultTriggerAndCb,
    });
  }

  findVersionByFileUrl(url) {
    const i = this.issue.publicationIssueDrafts.findIndex(
      (e) => e.filePublicUrl === url
    );
    return i + 1;
  }

  downloadFile(cancelled = false) {
    const cancel = cancelled ? '(canceled)' : '';
    const version = this.findVersionByFileUrl(this.draft.filePublicUrl);
    if (this.isBrowser) {
      this.draftService.downloadPdf(this.draft.filePublicUrl).subscribe(
        (data) => {
          const blob = new Blob([data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const filename = `${ this.issue.publicationName }#${ this.issue.number }v${ version }${ cancel }.pdf`;

          if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob);
            return;
          }

          const link = this.downloadPdfLink.nativeElement;
          link.href = url;
          link.download = filename;
          link.dispatchEvent(
            new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window,
            })
          );

          setTimeout(function () {
            window.URL.revokeObjectURL(data);
          }, 100);
        },
        (errorData) => {
          let error = 'Error Downloading File';
          const errorApi = this.alertService.errorApiToString(errorData, '');
          if (errorApi) {
            error += ': ' + errorApi;
          }
          this.alertService.showAlertDanger(error);
        }
      );
    }
  }

  openPdf() {
    // console.log(this.publication);
    this.http.head(this.draft.filePublicUrl).subscribe(
      (data) => {
        this.clickedCover = this.draft.filePublicUrl;
        this.showPopupPdfViewer = true;
        this.viewPdfEvent.emit(true);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  fileDroppedEvent(files: FileList) {
    this.fileDropped.emit(files);
  }

  sendForReview() {
    this.issueActionsService.submitForReview({
      draftId: this.draft ? this.draft.id : '',
      publication: this.publication,
      issue: this.issue,
      options: this.defaultTriggerAndCb,
    });
  }

  submitToPrint() {
    this.issueActionsService.submitToPrint({
      draftId: this.draft ? this.draft.id : '',
      publication: this.publication,
      issue: this.issue,
      options: this.defaultTriggerAndCb,
    });
  }

  openSharePreviewIssue() {
    this.issueActionsService.openPreviewIssue({ issue: this.issue, publication: this.publication });
  }

}
