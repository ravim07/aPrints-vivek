import { Injectable, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'auth/auth.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { take } from 'rxjs/operators';
import { MailingAddress, role, User } from '_models';
import { Issue } from '_models/issue.model';
import { Publication } from '_models/publication.model';
import { RequestAccessService, UserService } from '_services';
import { BaseActionsService } from '_services/base-actions.service';
import { IssueService } from '_services/issues.service';
import { LoadingService } from '_services/loading.service';
import { PublicationService } from '_services/publications.service';
import { IssueNewComponent } from '_shared/components/issue-new/issue-new.component';
import { PublicationNewComponent } from '_shared/components/publication-new/publication-new.component';
import { AlertService } from '_shared/services/alert.service';

const fundraising = new Set([role.sponsor, role.subscriber, role.advertiser]);
const requireAccessRoles = new Set([role.editorialStaff, role.contributor]);

@Injectable({ providedIn: 'root' })
export class OnboardingService extends BaseActionsService implements OnDestroy {
  private publicationSubject: Publication;
  private publicationId: string;
  private issueSubject: Issue;
  private roleSubject: string;
  private doneCreating = false;

  constructor(
    private alertService: AlertService,
    dialog: MatDialog,
    private publicationService: PublicationService,
    private issueService: IssueService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private requestAccessService: RequestAccessService,
    private authService: AuthService,
    private loadingService: LoadingService
  ) {
    super(dialog);
  }

  reset(doneCreating: boolean = false) {
    this.updatePublication(null);
    this.updatePublicationId(null);
    this.updateIssue(null);
    this.updateRole(null);
    this.doneCreating = doneCreating;
  }

  loadIdsFromStorage() {
    this.publicationSubject = this.getDataFromStorage('onboarding-publication');
    this.issueSubject = this.getDataFromStorage('onboarding-issue');
    this.roleSubject = this.getDataFromStorage('onboarding-roleStr', false);
    this.publicationId = this.getDataFromStorage(
      'onboarding-request-access-publication-id',
      false
    );
    console.log(
      'onboardingStorage',
      this.publicationSubject,
      this.issueSubject,
      this.roleSubject,
      this.publicationId
    );
  }

  getDataFromStorage(variable: string, parseObj: boolean = true) {
    if (!!localStorage.getItem(variable)) {
      if (parseObj) {
        return JSON.parse(localStorage.getItem(variable));
      } else {
        return localStorage.getItem(variable);
      }
    }
    return null;
  }

  getRole() {
    return this.roleSubject;
  }

  getPublicationId() {
    return this.publicationId;
  }

  updatePublication(publication: Publication | null) {
    this.publicationSubject = publication;
    if (publication === null) {
      window.localStorage.removeItem('onboarding-publication');
    } else {
      window.localStorage['onboarding-publication'] = JSON.stringify(
        publication
      );
    }
  }

  updateIssue(issue: Issue | null) {
    this.issueSubject = issue;
    if (issue === null) {
      window.localStorage.removeItem('onboarding-issue');
    } else {
      window.localStorage['onboarding-issue'] = JSON.stringify(issue);
    }
  }

  updateRole(roleStr: string | null) {
    this.roleSubject = roleStr;
    if (roleStr === null) {
      window.localStorage.removeItem('onboarding-roleStr');
    } else {
      window.localStorage['onboarding-roleStr'] = roleStr;
    }
  }

  updatePublicationId(publicationId: string | null) {
    this.publicationId = publicationId;
    if (publicationId === null) {
      window.localStorage.removeItem(
        'onboarding-request-access-publication-id'
      );
    } else {
      window.localStorage[
        'onboarding-request-access-publication-id'
        ] = publicationId;
    }
  }

  newPublicationDialog(cb: Function): void {
    const dialogConfig = this.setDialogConfig(
      ['flat-dialog', 'normal', 'height-600', 'width-550'],
      { name: '', organization: '', description: '' }
    );
    this.dialog
      .open(PublicationNewComponent, dialogConfig)
      .afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe((result) => {
        if (result) {
          console.log('Done Dialog', result);
          this.updatePublication(result);
          cb(result);
        }
      });
  }

  newIssueDialog(publication: Publication, cb: Function): void {
    const dialogConfig = this.setDialogConfig(
      ['flat-dialog', 'normal', 'space-around', 'height-700', 'width-700'],
      { name: '', publication: publication }
    );
    this.dialog
      .open(IssueNewComponent, dialogConfig)
      .afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe((result) => {
        if (result && result.data) {
          console.log('Done Dialog', result);
          this.updateIssue(result.data);
        }
        cb(result);
      });
  }

  registerOrContinue() {
    console.log('register');
    this.authService
      .isAuthenticated()
      .pipe(take(1))
      .subscribe((auth) => {
        console.log('Done checking if authenticated', auth);
        if (auth) {
          this.finishOnboarding();
        } else {
          this.router.navigate(['/onboarding/register']);
        }
      });
  }

  managingEditor() {
    this.updateRole(role.managingEditor);
    this.newPublicationDialog(() => {
      const pub = new Publication();
      pub.mailingAddress = new MailingAddress();
      this.newIssueDialog(pub, (result) => {
        console.log('Issue', result);
        if (result) {
          this.registerOrContinue();
        }
      });
    });
  }

  registerUser(registerForm: FormGroup) {
    if (registerForm.valid) {
      const user = new User(),
        fullname = registerForm.get('fullname').value.trim(),
        fullNameParts = fullname.split(' ');
      user.email = registerForm.get('email').value.toLowerCase();
      user.password = registerForm.get('password').value;
      user.lastName = '';
      user.userType = this.roleSubject;
      if (fullNameParts.length > 1) {
        user.lastName = fullNameParts[fullNameParts.length - 1];
      }
      user.name = fullname.replace(user.lastName, '').trim();

      this.loadingService.showAnimation(
        'Account creation',
        `We're setting up your account...`
      );
      this.userService.registerUser(user).subscribe(
        (newUser: User) => {
          if (newUser.name === 'ValidationError') {
            this.loadingService.hideAnimation();
            this.alertService.showAlertDanger('The email already exists');
          } else {
            this.authService.login(newUser);
            this.finishOnboarding();
          }
        },
        (errorData: any) => {
          console.error('Error', errorData);
          this.loadingService.hideAnimation();
          this.alertService.showAlertDanger('The email already exists');
        }
      );
    } else {
      Object.keys(registerForm.controls).forEach((field) => {
        const control = registerForm.get(field);
        control.markAsTouched({ onlySelf: true });
      });
    }
  }

  finishOnboarding() {
    const token = this.route.snapshot.queryParams['join-publication'];
    if (token) {
      this.loadingService.hideAnimation();
      this.router.navigate(['/join-publication'], {
        queryParams: { token: token },
      });
    } else {
      if (!this.doneCreating) {
        console.log('creating things');
        if (this.roleSubject === role.managingEditor) {
          this.loadingService.changeAnimationData(
            'Onboarding',
            `We're setting up your new publication...`
          );
          this.publicationService
            .createPublication(this.publicationSubject)
            .subscribe((pub: Publication) => {
              this.loadingService.changeAnimationData(
                'Onboarding',
                `We're setting up your new issue...`
              );
              if (this.issueSubject) {
                this.issueService
                  .createIssue(pub.id, this.issueSubject)
                  .subscribe((issue: Issue) => {
                    this.loadingService.changeAnimationData(
                      'Onboarding',
                      'Done...'
                    );
                    this.reset(true);
                    this.loadingService.hideAnimation();
                    /*this.router.navigate([
                      `/dashboard/publication/${pub.id}/issues/${issue.id}`,
                    ]);*/
                    this.router.navigate([
                      '/dashboard',
                      'publication',
                      pub.id
                    ]);
                  });
              } else {
                this.loadingService.changeAnimationData(
                  'Onboarding',
                  'Done...'
                );
                this.reset(true);
                this.loadingService.hideAnimation();
                this.router.navigate([
                  '/dashboard',
                  'publication',
                  pub.id
                ]);
              }
            });
        } else if (requireAccessRoles.has(this.roleSubject)) {
          let routine = '';
          console.log(this.roleSubject);
          switch (this.roleSubject) {
            case role.editorialStaff:
              routine = 'requestAccessAsEditor';
              break;
            case role.contributor:
              routine = 'requestAccessAsContributor';
              break;
          }
          this.loadingService.changeAnimationData(
            'Onboarding',
            `We're sending your request...`
          );
          this.requestAccessService[routine](this.publicationId).subscribe(
            (data) => {
              this.reset(true);
              this.loadingService.hideAnimation();
              this.router.navigateByUrl('/dashboard');
              /*this.router.navigate([
                '/dashboard',
                'publication',
                this.publicationId
              ]);*/
            },
            (errorData) => {
              this.reset(true);
              this.loadingService.hideAnimation();
              this.alertService.showAlertDanger(
                'Error requesting access to publication'
              );
              this.router.navigateByUrl('/dashboard');
            }
          );
        }
      }
    }
  }

  editorialStaff() {
    this.updateRole(role.editorialStaff);
    this.router.navigate(['/onboarding/search-publication']);
  }

  contributor() {
    this.updateRole(role.contributor);
    this.router.navigate(['/onboarding/search-publication']);
  }
}
