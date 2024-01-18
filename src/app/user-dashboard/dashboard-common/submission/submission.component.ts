import { isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild, ViewEncapsulation, } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms/';
import { MatSelectChange } from '@angular/material/select';
import { MatSidenav } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeEvent } from '@ckeditor/ckeditor5-angular';
import { AuthService } from 'auth/auth.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { Observable } from 'rxjs';
import { IssueBaseComponent } from 'user-dashboard/shared/components';
import { IssueResolverService, PublicationResolverService, } from 'user-dashboard/shared/resolvers';
import { ArticleService, ContributionService, SubmissionsActionsService, } from 'user-dashboard/shared/services';
import { StoreService } from 'user-dashboard/shared/state';
import { ContributionFeedback, User } from '_models';
import { ContributionEntry } from '_models/contribution-entry.model';
import { Contribution } from '_models/contribution.model';
import { DraftService, PermissionsService } from '_services';
import { UploadAdapter } from '_shared/other';
import { AlertService } from '_shared/services';
import { ArticleEditorConfigToken, EDITOR_CONFIG, EDITOR_CONFIG_PROVIDER, } from './article-editor-config';
import { CkeditorUploaderService } from '_services/ckeditor-uploader.service';


// import * as DocumentEditor from '@ckeditor/ckeditor5-build-decoupled-document';

declare var $: any;

@Component({
  selector: 'app-submission',
  templateUrl: './submission.component.html',
  styleUrls: [
    '../../shared/components/issue-base/issue-base.component.scss',
    './submission.component.scss',
  ],
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'd-flex flex-column flex-fill',
  },
  providers: [EDITOR_CONFIG_PROVIDER, ArticleService, CkeditorUploaderService],
})
export class SubmissionComponent extends IssueBaseComponent implements OnInit {
  isBrowser = false;
  public Editor;
  articleTitleForm: FormGroup;
  feedbackFormGroup: FormGroup;

  currentUser: User;
  url: string;
  token: string;

  loading = true;
  addEntry = false;
  canBeSaved = false;

  articleNameEdit = false;
  articleEntry: string;

  uploading: Observable<boolean>;
  showProgress: Observable<boolean>;
  uploadProgress: Observable<number>;

  fileUploadProgress = 0;
  sendingImage = false;
  sendingText = false;

  contribution: Contribution = new Contribution();
  entry: ContributionEntry = new ContributionEntry();
  originalEntry: ContributionEntry;

  attachmentsToSend = [];

  @ViewChild('feedback', { static: false }) feedback: MatSidenav;
  @ViewChild('downloadPdfLink', { static: false }) downloadPdfLink: ElementRef;
  @ViewChild('titleInput', { static: false }) titleInput: ElementRef;
  editorConfig;

  constructor(
    private authService: AuthService,
    private articleService: ArticleService,
    private alertService: AlertService,
    private contributionsService: ContributionService,
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
      // const EditorBuild = require('@ckeditor/ckeditor5-build-classic');
      const EditorBuild = require('@ckeditor/ckeditor5-build-decoupled-document');
      this.Editor = EditorBuild;
      // this.Editor.defaultConfig = editorConfig;
      this.editorConfig = editorConfig;
    }
  }

  async ngOnInit() {
    this.loading = true;
    this.currentUser = this.authService.getCurrentUser();
    this.uploadProgress = this.articleService.uploadProgressObs;
    this.showProgress = this.articleService.showProgressObs;
    this.uploading = this.articleService.uploadingObs;
    this.articleTitleForm = new FormGroup({
      title: new FormControl(null, [Validators.required]),
    });
    this.feedbackFormGroup = new FormGroup({
      content: new FormControl(null, [Validators.required]),
    });

    this.storeService
      .currentPublicationIssueArticle()
      .subscribe(async (data) => {
        this.addEntry =
          this.route.snapshot.paramMap.get('contributionId') === 'new';
        this.publication = data.publication;
        this.issue = data.issue;
        if (data.contribution) {
          this.setContribution(data.contribution);
          this.initTitleForm();
          this.setAttachmentsUploadSettings();
          if (!this.entry.article) {
            this.entry.article = '';
          }
          this.loading = false;
        } else {
          this.articleNameEdit = true;
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

  setContribution(contribution: Contribution) {
    this.canBeSaved = false;
    this.contribution = contribution;

    if (this.contribution.entries.length > 0) {
      const lastIndex = this.contribution.entries.length - 1;
      this.articleEntry = this.contribution.entries[lastIndex].id;
      this.entry = this.contribution.entries[lastIndex];
      this.originalEntry = new ContributionEntry().deserialize({
        ...this.contribution.entries[lastIndex],
      });
      this.addEntry = false;
    }
    this.articleTitleForm.get('title').patchValue(this.contribution.title);
    this.loading = false;
  }

  setAttachmentsUploadSettings() {
    const values = this.articleService.setAttachmentsUploadSettings(
      this.publication,
      this.contribution,
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
    // const data = editor.getData();
    // console.log('EditorDataChanged', data);
    this.canBeSaved = this.articleService.checkChangesAndIfValid(
      this.contribution,
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

    this.myCustomUploadAdapterPlugin(
      editorInstance,
    );
    editorInstance.isReadOnly = this.articleService.getIfEditorSetToReadOnly(
      this.publication,
      this.contribution,
      this.entry
    );
    // editorInstance.removeButtons = 'BGColor,Table,Media';
    // console.log( 'onReady Editor', editorInstance );
  }

  initTitleForm() {
    this.articleTitleForm
      .get('title')
      .valueChanges.pipe(untilDestroyed(this))
      .subscribe((value) => {
        this.contribution.title = value;
        this.canBeSaved = this.articleService.checkChangesAndIfValid(
          this.contribution,
          this.entry,
          this.originalEntry,
          this.addEntry
        );
      });
  }

  editArticleTitle() {
    this.articleNameEdit = true;
  }

  saveArticleTitle() {
    this.articleNameEdit = false;
    if (!this.addEntry) {
      this.contributionsService
        .update(this.contribution.id, this.contribution)
        .subscribe((response) => {
          const contribution = new Contribution().deserialize(response);
          this.storeService
            .refreshArticle(contribution.id)
            .subscribe((article) => {
              this.setContribution(article);
              this.alertService.showAlertSuccess('Article updated!');
            });
        });
    }
  }

  compareAttachments() {
  }

  saveContribution() {
    this.articleService.saveContribution(
      this.issue,
      this.contribution,
      this.entry,
      this.originalEntry
    );
    this.articleNameEdit = false;
    this.canBeSaved = false;
  }

  switchVersion(event: MatSelectChange) {
    console.log(this.articleEntry, event);
    if (this.contribution.entries.length > 0) {
      const entry = this.contribution.entries.find(
        (item) => item.id === this.articleEntry
      );
      this.entry = entry;
      this.originalEntry = entry;
      this.setAttachmentsUploadSettings();
    }
  }

  addComment() {
    const feedbackData = Object.assign(
      new ContributionFeedback(),
      this.feedbackFormGroup.getRawValue()
    );
    this.sendingText = true;
    if (!feedbackData.content) {
      this.alertService.showAlertDanger(
        'Comments cannot be empty! No comments were sent!'
      );
    } else {
      this.contributionsService
        .addFeedback(this.contribution.id, this.entry.id, feedbackData)
        .subscribe((response: ContributionFeedback) => {
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
    this.contributionsService
      .getContribution(this.contribution.id)
      .subscribe(async (contribution) => {
        this.setContribution(contribution);
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
      `/issues/${ this.issue.id }/submissions`,
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
