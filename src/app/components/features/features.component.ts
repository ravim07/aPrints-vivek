import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'auth/auth.service';
import { environment } from 'environments/environment';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { role } from '_models';
import { LoginService } from '_services';
import { LastModifiedIssueService } from '_services/last-modified-issue.service';

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss'],
})
export class FeaturesComponent implements OnInit, OnDestroy {
  assetsUrl = environment.assetsUrl;
  isManager = false;
  isEditor = false;
  isContributor = false;
  loggedIn = false;
  lastStatusAsManager;
  lastStatusAsEditor;
  lastStatusAsContributor;
  innerWidth;
  showVideoPopup = false;
  videoSrc = '';
  popupVideoClass = '';
  @ViewChild('modal', { static: false }) private modal: ElementRef;

  constructor(
    private authService: AuthService,
    private lastModifiedIssueService: LastModifiedIssueService,
    private loginService: LoginService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.innerWidth = window.innerWidth;
    await this.lastModifiedIssueService.init();
    this.lastModifiedIssueService.lastStatusAsManager
      .pipe(untilDestroyed(this))
      .subscribe((d) => (this.lastStatusAsManager = d));
    this.lastModifiedIssueService.lastStatusAsEditor
      .pipe(untilDestroyed(this))
      .subscribe((d) => (this.lastStatusAsEditor = d));
    this.lastModifiedIssueService.lastStatusAsContributor
      .pipe(untilDestroyed(this))
      .subscribe((d) => (this.lastStatusAsContributor = d));
    this.lastModifiedIssueService.isManager
      .pipe(untilDestroyed(this))
      .subscribe((d) => (this.isManager = d));
    this.lastModifiedIssueService.isEditor
      .pipe(untilDestroyed(this))
      .subscribe((d) => (this.isEditor = d));
    this.lastModifiedIssueService.isContributor
      .pipe(untilDestroyed(this))
      .subscribe((d) => (this.isContributor = d));
    this.loggedIn = !!this.authService.getCurrentUser();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
  }

  clickGetStarted() {
    if (this.authService.getCurrentUser()) {
      if (this.authService.isRole(role.admin)) {
        this.router.navigateByUrl('/admin');
      } else {
        this.router.navigateByUrl('/dashboard');
      }
    } else {
      this.router.navigateByUrl('/onboarding');
    }
  }

  goToLogin() {
    // this.router.navigate([{ outlets: { popup: 'login' } }], { queryParamsHandling: 'preserve' });
    this.loginService.loginDialog();
  }

  goToOnboarding() {
    this.router.navigateByUrl('/onboarding');
  }

  startManaging() {
    if (this.authService.getCurrentUser() && this.lastStatusAsManager) {
      const pub = this.lastStatusAsManager.publicationId;
      const issue = this.lastStatusAsManager.issueId;
      const url = `/dashboard/publication/${pub}/issue/${issue}`;
      this.router.navigateByUrl(url);
    } else {
      this.goToOnboarding();
    }
  }

  setSponsorship() {
    if (this.authService.getCurrentUser() && this.lastStatusAsManager) {
      const pub = this.lastStatusAsManager.publicationId;
      const issue = this.lastStatusAsManager.issueId;
      this.router.navigateByUrl(
        `/dashboard/publication/${pub}/issue/${issue}?tab=sponsorship`
      );
      // const invites = `/dashboard/publication/${pub}/fundraising/invites?issueId=${issue}`;
      // const levels = `/dashboard/publication/${pub}/fundraising/levels?issueId=${issue}`;
      // this.fundraisingService.getListDonationsLevels(pub).pipe(untilDestroyed(this)).subscribe(data => {
      //   if (data.length) {
      //     this.router.navigateByUrl(invites);
      //   } else {
      //     this.router.navigateByUrl(levels);
      //   }
      // });
      // this.router.navigateByUrl(invites); // Invite sponsors -- last issue
    } else {
      this.goToOnboarding();
    }
  }

  goToArticles() {
    let obj;
    if (this.lastStatusAsManager) {
      obj = this.lastStatusAsManager;
    } else if (this.lastStatusAsEditor) {
      obj = this.lastStatusAsEditor;
    } else {
      obj = this.lastStatusAsContributor;
    }
    if (this.authService.getCurrentUser() && obj) {
      const pub = obj.publicationId;
      const issue = obj.issueId;
      const url = `/dashboard/publication/${pub}/issue/${issue}#articles`;
      this.router.navigateByUrl(url); // Articles section -- last issue
    } else {
      this.router.navigateByUrl('/onboarding');
    }
  }

  inviteMembers() {
    let obj;
    if (this.lastStatusAsManager) {
      obj = this.lastStatusAsManager;
    } else {
      obj = this.lastStatusAsEditor;
    }
    if (this.authService.getCurrentUser() && obj) {
      const pub = obj.publicationId;
      const issue = obj.issueId;
      const url = `/dashboard/publication/${pub}/members?issueId=${issue}`;
      this.router.navigateByUrl(url); // Invite members -- last issue
    } else {
      this.goToOnboarding();
    }
  }

  contributor() {
    if (this.authService.getCurrentUser() && this.lastStatusAsContributor) {
      // console.log(this.lastStatusAsContributor);
      const pub = this.lastStatusAsContributor.publicationId;
      const issue = this.lastStatusAsContributor.issueId;
      const url = `/dashboard/publication/${pub}/issue/${issue}/articles`;
      this.router.navigateByUrl(url);
    } else {
      this.goToOnboarding();
    }
  }

  goToSponsorSearch() {
    this.router.navigateByUrl('/onboarding/sponsor/searchPublication');
  }

  doVideoPopup() {
    this.popupVideoClass = 'modal-show';
    this.showVideoPopup = true;
  }

  editorialStaffVideo() {
    this.videoSrc =
      this.assetsUrl + '/videos/edit-publication-editorial-staff.mp4';
    this.doVideoPopup();
  }

  firstPublicationVideo() {
    this.videoSrc = this.assetsUrl + '/videos/content-funds-print.mp4';
    this.doVideoPopup();
  }

  contributorVideo() {
    this.videoSrc = this.assetsUrl + '/videos/contribute-magazine.mp4';
    this.doVideoPopup();
  }

  sponsorVideo() {
    this.videoSrc = this.assetsUrl + '/videos/sponsor-publication.mp4';
    this.doVideoPopup();
  }

  closeVideoPopup() {
    this.showVideoPopup = false;
    this.popupVideoClass = '';
  }

  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (this.showVideoPopup) {
      if (event.target.contains(this.modal.nativeElement)) {
        this.closeVideoPopup();
      }
    }
  }

  ngOnDestroy() {}
}
