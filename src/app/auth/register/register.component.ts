import { isPlatformBrowser } from '@angular/common';
import { HttpBackend, HttpClient } from '@angular/common/http';
import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'auth/auth.service';
import { environment } from 'environments/environment';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { from, Observable } from 'rxjs';
import { issueStatus, PublicationPreview, Review, role, User } from '_models';
import { Issue } from '_models/issue.model';
import {
  DraftService,
  InvitationService,
  IssueService,
  LoginService,
  PublicationService,
  ReviewService,
  UserService,
} from '_services';
import { CustomCarouselComponent } from '_shared/components';
import { AlertService, HelperService } from '_shared/services';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  providers: [ReviewService, DraftService],
})
export class RegisterComponent implements OnInit, OnDestroy {
  assetsUrl = environment.assetsUrl;
  pdfFolder = `${environment.assetsUrl}/template-pdfs/`;
  private http: HttpClient;
  publicationPreview: PublicationPreview;
  loading = true;
  registerForm: FormGroup;
  errorApi: string;
  formStatusClass = '';
  tokenInvitation = '';
  registerFromInvitation = false;
  invitationData;
  formData = {
    name: null,
    email: null,
  };
  registerFromRequestAccess = '';
  reviews$: Observable<Review[]>;
  isBrowser = false;

  @Output() clickedCover;
  showPopupPdfViewer;
  @ViewChild('downloadPdfLink', { static: false }) downloadPdfLink;

  issue: Issue;
  currentDraft;
  issueStatus = issueStatus;
  showPdfPreview = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private rs: ReviewService,
    private helper: HelperService,
    private alertService: AlertService,
    private draftService: DraftService,
    private invitationService: InvitationService,
    private publicationService: PublicationService,
    private issueService: IssueService,
    private loginService: LoginService,
    @Inject(PLATFORM_ID) private platformId: Object,
    handler: HttpBackend
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.http = new HttpClient(handler);
    this.createRegisterForm();
  }

  ngOnInit() {
    this.invitationData = null;
    const invitationToken = this.route.snapshot.queryParams['join-publication'];
    this.registerFromRequestAccess = this.route.snapshot.queryParams[
      'request-access'
    ];
    if (invitationToken) {
      this.invitationService
        .findAndCheckIfValid(invitationToken)
        .subscribe((data) => {
          // console.log(data);
          this.tokenInvitation = invitationToken;
          this.registerFromInvitation = true;
          this.invitationData = {
            publication: decodeURIComponent(data.inviteTargetName),
            role: role.getStrRole(data.inviteType),
          };
          this.registerForm.patchValue({
            name: data.name,
            email: data.email,
          });
          this.publicationService
            .getPublicationPreview(data.inviteTargetId)
            .subscribe((preview) => {
              this.publicationPreview = preview;
              // console.log(preview);
              if (preview.issueId) {
                this.issueService
                  .getIssue(preview.issueId)
                  .subscribe((issue) => {
                    this.issue = issue;
                    // console.log(issue);
                    this.currentDraft = this.issue.getCurrentDraft();
                    console.log(this.currentDraft);
                    if (!this.currentDraft) {
                      this.showPdfPreview = false;
                    } else {
                      switch (this.issue.status) {
                        case this.issueStatus.issueCreated:
                        case this.issueStatus.printingDataConfirmed:
                          this.showPdfPreview = false;
                          break;
                        default:
                          this.showPdfPreview = true;
                          break;
                      }
                    }
                    this.loading = false;
                  });
              } else {
                this.showPdfPreview = false;
                this.loading = false;
              }
            });
          this.initReviewsAndForm();
        });
    } else {
      this.initReviewsAndForm();
    }
  }

  initReviewsAndForm() {
    this.createRegisterForm();
  }

  createRegisterForm() {
    this.registerForm = new FormGroup({
      fullname: new FormControl(this.formData.name, [
        Validators.required,
        Validators.minLength(6),
      ]),
      email: new FormControl(this.formData.email, [
        Validators.required,
        Validators.email,
      ]),
      password: new FormControl(null, [
        Validators.required,
        Validators.minLength(8),
      ]),
    });
  }

  registerUser() {
    this.formStatusClass = 'form-inprogress-submit';
    this.errorApi = '';

    if (this.registerForm.valid) {
      const user = new User(),
        fullname = this.registerForm.get('fullname').value.trim(),
        fullNameParts = fullname.split(' ');
      user.email = this.registerForm.get('email').value.toLowerCase();
      user.password = this.registerForm.get('password').value;
      user.lastName = '';
      if (fullNameParts.length > 1) {
        user.lastName = fullNameParts[fullNameParts.length - 1];
      }
      user.name = fullname.replace(user.lastName, '').trim();

      this.userService.registerUser(user).subscribe(
        (newUser: User) => {
          if (newUser.name === 'ValidationError') {
            this.errorApi = 'The email already exists';
            this.formStatusClass = '';
          } else {
            this.authService.login(newUser);
            if (this.registerFromInvitation) {
              this.router.navigateByUrl(
                '/join-publication?token=' + this.tokenInvitation
              );
            } else if (this.registerFromRequestAccess) {
              this.router.navigateByUrl(
                '/publication/' + this.registerFromRequestAccess
              );
            } else {
              this.router.navigate(['/dashboard']);
            }
          }
        },
        (errorData: any) => {
          console.error('Error', errorData);
          this.errorApi = 'The email already exists';
          this.formStatusClass = '';
        }
      );
    } else {
      Object.keys(this.registerForm.controls).forEach((field) => {
        const control = this.registerForm.get(field);
        control.markAsTouched({ onlySelf: true });
      });
      this.formStatusClass = '';
    }
  }

  resetRegisterError() {
    this.errorApi = '';
  }

  goToFacebookLogin() {
    this.setDataRegisterFrom();
    window.location.href = environment.loginFacebookUrl;
  }

  goToGoogleLogin() {
    this.setDataRegisterFrom();
    window.location.href = environment.loginGoogleUrl;
  }

  private setDataRegisterFrom() {
    if (this.registerFromInvitation) {
      this.authService.setInvitationToken(this.tokenInvitation);
    }

    if (this.registerFromRequestAccess) {
      this.authService.setRequestAccessPublication(
        this.registerFromRequestAccess
      );
    }
  }

  goToLogin() {
    // this.router.navigate([{ outlets: { popup: 'login' } }], { queryParamsHandling: 'preserve' });
    this.loginService.loginDialog();
  }

  findFileUrl(o) {
    const i = this.issue.publicationIssueDrafts.findIndex(
      (e) => e.id === o.draftId
    );
    return this.issue.publicationIssueDrafts[i].filePublicUrl;
  }

  findVersionByFileUrl(url) {
    const i = this.issue.publicationIssueDrafts.findIndex(
      (e) => e.filePublicUrl === url
    );
    return i + 1;
  }

  downloadFile(fileUrl = this.currentDraft.filePublicUrl, cancelled = false) {
    const cancel = cancelled ? '(canceled)' : '';
    if (typeof fileUrl === 'object') {
      fileUrl = this.findFileUrl(fileUrl);
    }
    const version = this.findVersionByFileUrl(fileUrl);
    if (this.isBrowser) {
      this.draftService.downloadPdf(fileUrl).subscribe(
        (data) => {
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
    this.http.head(this.publicationPreview.fileUrl).subscribe(
      (data) => {
        this.clickedCover = this.publicationPreview.fileUrl;
        this.showPopupPdfViewer = true;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  onPdfViewerPopupEvent(evt) {
    if (evt.type === 'popup.closed') {
      this.showPopupPdfViewer = false;
    }
  }

  ngOnDestroy() {}
}
