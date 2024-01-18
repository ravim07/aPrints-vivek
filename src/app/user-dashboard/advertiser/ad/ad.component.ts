import { isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild, ViewEncapsulation, } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms/';
import { MatSelectChange } from '@angular/material/select';
import { MatSidenav } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeEvent, CKEditorComponent } from '@ckeditor/ckeditor5-angular';
import { AuthService } from 'auth/auth.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { Observable, Subscription } from 'rxjs';
import { IssueBaseComponent } from 'user-dashboard/shared/components';
import { IssueResolverService, PublicationResolverService, } from 'user-dashboard/shared/resolvers';
import { SubmissionsActionsService, } from 'user-dashboard/shared/services';
import { StoreService } from 'user-dashboard/shared/state';
import { ContributionFeedback, User } from '_models';
import { DraftService, PermissionsService } from '_services';
import { UploadAdapter } from '_shared/other';
import { AlertService } from '_shared/services';
import {
  ArticleEditorConfigToken,
  EDITOR_CONFIG,
  EDITOR_CONFIG_PROVIDER
} from 'user-dashboard/dashboard-common/submission/article-editor-config';
import { AdResource } from '_models/ad-resource.model';
import { AdvertisementEntry } from '_models/advertisement-entry.model';
import { AdService } from 'user-dashboard/shared/services/ad.service';
import { AdvertisementService } from 'user-dashboard/shared/services/advertisement.service';
import { AdvertisementFeedback } from '_models/advertisement-feedback.model';
import { CkeditorUploaderService } from '_services/ckeditor-uploader.service';

declare var $: any;

@Component({
  selector: 'app-submission',
  templateUrl: './ad.component.html',
  styleUrls: [
    '../../shared/components/issue-base/issue-base.component.scss',
    './ad.component.scss',
  ],
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'd-flex flex-column flex-fill',
  },
  providers: [EDITOR_CONFIG_PROVIDER, AdService, CkeditorUploaderService],
})
export class AdComponent extends IssueBaseComponent implements OnInit {
  isBrowser = false;
  public Editor;
  adTitleForm: FormGroup;
  feedbackFormGroup: FormGroup;
  currentUser: User;
  url: string;
  token: string;
  loading = true;
  addEntry = false;
  canBeSaved = false;
  adNameEdit = false;
  advertisementEntry: string;
  uploading: Observable<boolean>;
  showProgress: Observable<boolean>;
  uploadProgress: Observable<number>;
  fileUploadProgress = 0;
  sendingImage = false;
  sendingText = false;
  advertisement: AdResource = new AdResource();
  entry: AdvertisementEntry = new AdvertisementEntry();
  originalEntry: AdvertisementEntry;
  attachmentsToSend = [];
  @ViewChild('feedback', { static: false }) feedback: MatSidenav;
  @ViewChild('downloadPdfLink', { static: false }) downloadPdfLink: ElementRef;
  @ViewChild('titleInput', { static: false }) titleInput: ElementRef;
  titleFormObs: Subscription;
  @ViewChild(CKEditorComponent, { static: false }) editorRef;
  editorConfig;

  constructor(
    private authService: AuthService,
    private advertisementService: AdService,
    private alertService: AlertService,
    private adService: AdvertisementService,
    private draftService: DraftService,
    private ckeditorUploaderService: CkeditorUploaderService,
    route: ActivatedRoute,
    router: Router,
    publicationResolverService: PublicationResolverService,
    issueResolverService: IssueResolverService,
    submissionsActionsService: SubmissionsActionsService,
    permissionsService: PermissionsService,
    storeService: StoreService,
    @Inject(PLATFORM_ID) platformId: Object,
    @Inject(EDITOR_CONFIG) editorConfig: ArticleEditorConfigToken
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
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      const EditorBuild = require('@ckeditor/ckeditor5-build-decoupled-document');
      this.Editor = EditorBuild;
      // this.Editor.defaultConfig = editorConfig;
      this.editorConfig = editorConfig;
    }
  }

  async ngOnInit() {
    this.loading = true;
    this.currentUser = this.authService.getCurrentUser();
    this.uploadProgress = this.advertisementService.uploadProgressObs;
    this.showProgress = this.advertisementService.showProgressObs;
    this.uploading = this.advertisementService.uploadingObs;
    this.adTitleForm = new FormGroup({
      title: new FormControl(null, [Validators.required]),
    });
    this.feedbackFormGroup = new FormGroup({
      content: new FormControl(null, [Validators.required]),
    });
    this.storeService
      .currentPublicationIssueAdvertisement()
      .subscribe(async (data) => {
        this.addEntry =
          this.route.snapshot.data.addEntry;
        this.publication = data.publication;
        this.issue = data.issue;
        if (data.advertisement) {
          this.setAdvertisement(data.advertisement);
          this.initTitleForm();
          this.setAttachmentsUploadSettings();
          if (!this.entry.article) {
            this.entry.article = '';
          }
          this.loading = false;
        } else {
          this.adNameEdit = true;
          this.entry.article = '';
          this.loading = false;
          this.initTitleForm();
          if (this.addEntry) {
            setTimeout(() => {
              this.titleInput.nativeElement.focus();
            });
          }
        }
      });
  }

  setAdvertisement(advertisement: AdResource) {
    this.canBeSaved = false;
    this.advertisement = advertisement;
    if (this.advertisement.entries.length > 0) {
      const lastIndex = this.advertisement.entries.length - 1;
      this.advertisementEntry = this.advertisement.entries[lastIndex].id;
      this.entry = this.advertisement.entries[lastIndex];
      this.originalEntry = new AdvertisementEntry().deserialize({
        ...this.advertisement.entries[lastIndex],
      });
      this.addEntry = false;
    }
    this.adTitleForm.get('title').patchValue(this.advertisement.title);
    this.loading = false;
  }

  setAttachmentsUploadSettings() {
    const values = this.advertisementService.setAttachmentsUploadSettings(
      this.publication,
      this.advertisement,
      this.entry
    );
    if (values) {
      ({ url: this.url, token: this.token } = values);
    }
  }

  myCustomUploadAdapterPlugin(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
      return new UploadAdapter(loader, this.ckeditorUploaderService);
    };
  }

  public onChange({ editor }: ChangeEvent) {
    this.canBeSaved = this.advertisementService.checkChangesAndIfValid(
      this.advertisement,
      this.entry,
      this.originalEntry,
      this.addEntry
    );
  }

  public onReady(editorInstance) {
    editorInstance.ui.getEditableElement().parentElement.insertBefore(
      editorInstance.ui.view.toolbar.element,
      editorInstance.ui.getEditableElement()
    );

    this.myCustomUploadAdapterPlugin(editorInstance);
    /*editorInstance.isReadOnly = this.articleService.getIfEditorSetToReadOnly(
      this.publication,
      this.advertisement,
      this.entry
    );*/
    // console.log( 'onReady Editor', editorInstance );
  }

  initTitleForm() {
    if (this.titleFormObs) {
      this.titleFormObs.unsubscribe();
    }
    this.titleFormObs =
      this.adTitleForm
        .get('title')
        .valueChanges.pipe(untilDestroyed(this))
        .subscribe((value) => {
          this.advertisement.title = value;
          this.canBeSaved = this.advertisementService.checkChangesAndIfValid(
            this.advertisement,
            this.entry,
            this.originalEntry,
            this.addEntry
          );
        });
  }

  editArticleTitle() {
    this.adNameEdit = true;
  }

  saveAdTitle() {
    this.adNameEdit = false;
    if (!this.addEntry) {
      this.adService
        .update(this.advertisement.id, this.advertisement)
        .subscribe((response) => {
          const advertisement = new AdResource().deserialize(response);
          this.storeService
            .refreshAdvertisement(advertisement.id)
            .subscribe((ad) => {
              this.setAdvertisement(ad);
              this.alertService.showAlertSuccess('Article updated!');
            });
        });
    }
  }

  compareAttachments() {
  }

  saveAd() {
    this.advertisementService.saveAdvertisement(
      this.issue,
      this.advertisement,
      this.entry,
      this.originalEntry
    );
    this.adNameEdit = false;
    this.canBeSaved = false;
  }

  switchVersion(event: MatSelectChange) {
    console.log(this.advertisementEntry, event);
    if (this.advertisement.entries.length > 0) {
      const entry = this.advertisement.entries.find(
        (item) => item.id === this.advertisementEntry
      );
      this.entry = entry;
      this.originalEntry = entry;
      this.setAttachmentsUploadSettings();
    }
  }

  addComment() {
    const feedbackData = Object.assign(
      new AdvertisementFeedback(),
      this.feedbackFormGroup.getRawValue()
    );
    this.sendingText = true;
    if (!feedbackData.content) {
      this.alertService.showAlertDanger(
        'Comments cannot be empty! No comments were sent!'
      );
    } else {
      this.adService
        .addFeedback(this.advertisement.id, this.entry.id, feedbackData)
        .subscribe((response: AdvertisementFeedback) => {
          this.feedbackFormGroup.get('content').reset();
          this.setFeedback('msg');
          // reload
        });
    }
  }

  inputFileChange($event) {
    $event.preventDefault();
    const files = [];
    files.push($event.target.files[0]);
    this.sendingImage = true;
    this.feedbackFormGroup.disable();
    // console.log(files);
    this.fileUploadProgress = 0;
    // const proms = files.map(
    //   async (file, i) =>
    //     new Promise((resolve, reject) => {
    //       this.publicationService
    //         .createDiscussionCommentAndAttachFile(
    //           this.publicationId,
    //           this.issueId,
    //           file
    //         )
    //         .subscribe(
    //           async (events) => {
    //             // console.log(events);
    //             if (events.type === HttpEventType.Response) {
    //               console.log(events.body);
    //               this.setFeedback('file');
    //               resolve(true);
    //             }
    //           },
    //           (err) => {
    //             this.alertService.showAlertDanger(
    //               'Upload failed! Make sure you are sending an image. Upload will fail with other file types!'
    //             );
    //             this.sendingImage = false;
    //             this.feedbackFormGroup.enable();
    //             reject(err);
    //           }
    //         );
    //     })
    // );
    // const fullProm = this.articleService.progressPromise(proms, (t: number, l: number) => {
    //   this.fileUploadProgress = this.articleService.calcProgress(t, l);
    //   // console.log(this.fileUploadProgress);
    // });
  }

  setFeedback(sent: string = 'none') {
    this.adService
      .getAdvertisement(this.advertisement.id)
      .subscribe(async (advertisement) => {
        this.setAdvertisement(advertisement);
        switch (sent) {
          case 'file':
            this.sendingImage = false;
            this.alertService.showAlertSuccess('File sent!');
            break;
          case 'msg':
            this.sendingText = false;
            break;
        }
        this.feedbackFormGroup.enable();
      });
  }

  trackByIdx(i: ContributionFeedback) {
    return i.id ? i.id : i.createdAt;
  }

  closeEditor() {
    this.router.navigate([
      `/dashboard/publication/${ this.publication.id }` +
      `/issues/${ this.issue.id }/ads`,
    ]);
  }

  downloadFile(downloadUrl) {
    if (this.isBrowser) {
      this.draftService.downloadPdf(downloadUrl).subscribe(
        (data) => {
          const blob = new Blob([data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);

          const link = this.downloadPdfLink.nativeElement;
          link.href = url;
          link.download =
            this.issue.publicationName + '-#' + this.issue.number + '.pdf';
          link.click();

          window.URL.revokeObjectURL(url);
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
}
