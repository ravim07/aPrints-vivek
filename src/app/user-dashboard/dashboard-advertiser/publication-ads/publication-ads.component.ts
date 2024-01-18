import { Component, OnInit, ViewChild, Output, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { Issue } from '_models/issue.model';
import { Publication } from '_models/publication.model';
import { AuthService } from 'auth/auth.service';
import { DraftService, AdvertisingService } from '_services';
import { environment } from 'environments/environment';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { Draft, issueStatus } from '_models';
import { AlertService } from '_shared/services';
import { AdResource } from '_models/ad-resource.model';
import { isPlatformBrowser } from '@angular/common';
import { untilDestroyed } from 'ngx-take-until-destroy';

@Component({
  selector: 'app-publication-ads',
  templateUrl: './publication-ads.component.html',
  styleUrls: ['./publication-ads.component.scss']
})
export class PublicationAdsComponent implements OnInit, OnDestroy {
  private http: HttpClient;
  assetsUrl = environment.assetsUrl;
  loading = true;
  publication: Publication;
  issue: Issue;
  adResources: AdResource[] = [];
  currentDraft: Draft;
  @ViewChild('downloadPdfLink', {static: false}) downloadPdfLink;

  currentUser;
  showAdResourcePopUp = false;
  currentAdResource: AdResource;
  statusString;

  @Output() clickedCover;
  showPopupPdfViewer;

  @ViewChild('dialogConfirmAdResource', {static: false}) dialogConfirmAdResource;
  isBrowser = false;

  constructor(private route: ActivatedRoute,
              private dialog: MatDialog,
              private alertService: AlertService,
              private draftService: DraftService,
              private authService: AuthService,
              private advertisingService: AdvertisingService,
              handler: HttpBackend, @Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.currentUser = this.authService.getCurrentUser();
    this.http = new HttpClient(handler);
  }

  ngOnInit() {
    this.route.data
    .pipe(untilDestroyed(this)).subscribe(data => {
        this.publication = data.publication;
        this.issue = data.issue; // console.log(this.issue);
        this.statusString = issueStatus.showStatus(this.issue.status);
        this.currentDraft = this.issue.getCurrentDraft();
        this.adResources = data.adResources.filter(e => e.issueId === data.issue.id);
        this.loading = false;
      });
  }

  createAdResourceIssue() {
    this.currentAdResource = new AdResource();
    this.showAdResourcePopUp = true;
  }

  viewAdResource(contribution: AdResource) {
    this.currentAdResource = contribution;
    this.showAdResourcePopUp = true;
  }

  onSaveAdResource() {
    this.showAdResourcePopUp = false;
    this.advertisingService.getMyOwnAdResources(this.issue.id)
      .subscribe((response: any) => {
        this.adResources = response.data;
      });
  }

  deleteAdResource(adResourceId, $event) {
    $event.preventDefault();
    $event.stopPropagation();

    this.dialog.open(this.dialogConfirmAdResource, { panelClass: 'confirm-dialog' }).afterClosed()
    .pipe(untilDestroyed(this)).subscribe((result) => {
        if (result) {
          this.advertisingService.deleteAdResource(adResourceId).subscribe(() => {
            this.advertisingService.getMyOwnAdResources(this.issue.id).subscribe((response: any) => {
              this.adResources = response.data;
            });
          });
        }
      });
  }

  openPdf() {
    // console.log(this.publication);
    this.http
    .head(this.currentDraft.filePublicUrl)
    .subscribe(
      data => {
        this.clickedCover = this.currentDraft.filePublicUrl;
        this.showPopupPdfViewer = true;
      },
      error => {
        console.log(error);
      }
    );
  }

  onPdfViewerPopupEvent(evt) {
    if (evt.type === 'popup.closed') {
      this.showPopupPdfViewer = false;
    }
  }

  downloadFile(fileUrl = this.currentDraft.filePublicUrl, cancelled = false) {
    const cancel = cancelled ? '(canceled)' : '';
    if ( typeof fileUrl === 'object' ) {
      fileUrl = this.findFileUrl(fileUrl);
    }
    const version = this.findVersionByFileUrl(fileUrl);
    if (this.isBrowser) {
      this.draftService.downloadPdf(fileUrl).subscribe(
        data => {
          const blob = new Blob([data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const filename = `${this.issue.publicationName}#${this.issue.number}v${version}${cancel}.pdf`;

          if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob);
            return;
          }

          const link = this.downloadPdfLink.nativeElement;
          link.href = url;
          link.download = filename;
          link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

          setTimeout(function () {
              window.URL.revokeObjectURL(data);
          }, 100);
        },
        errorData => {
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

  findFileUrl(o) {
    const i = this.issue.publicationIssueDrafts.findIndex(e => e.id === o.draftId);
    return this.issue.publicationIssueDrafts[i].filePublicUrl;
  }

  findVersionByFileUrl(url) {
    const i = this.issue.publicationIssueDrafts.findIndex(e => e.filePublicUrl === url);
    return i + 1;
  }

  ngOnDestroy() {}
}
