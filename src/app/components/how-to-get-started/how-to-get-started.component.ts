import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'auth/auth.service';
import { environment } from 'environments/environment';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { LoginService } from '_services';
import { LastModifiedIssueService } from '_services/last-modified-issue.service';
import { PageService } from '_shared/services';

@Component({
  selector: 'app-how-to-get-started',
  templateUrl: './how-to-get-started.component.html',
  styleUrls: ['./how-to-get-started.component.scss'],
})
export class HowToGetStartedComponent implements OnInit, OnDestroy {
  isManager = false;
  isEditor = false;
  isContributor = false;
  loggedIn = false;
  lastStatusAsManager;
  lastStatusAsEditor;
  lastStatusAsContributor;

  @ViewChild('esVideo', { static: false }) esVideo: ElementRef;
  @ViewChild('conVideo', { static: false }) conVideo: ElementRef;
  @ViewChild('spVideo', { static: false }) spVideo: ElementRef;
  @ViewChild('gsVideo', { static: false }) gsVideo: ElementRef;

  assetsUrl = environment.assetsUrl;
  videoData = {
    es: false,
    con: false,
    sp: false,
    gs: false,
  };
  @ViewChild('videoYoutube', { static: false }) video: any;

  constructor(
    private router: Router,
    private authService: AuthService,
    private loginService: LoginService,
    private lastModifiedIssueService: LastModifiedIssueService,
    private pageService: PageService
  ) {}

  async ngOnInit() {
    this.loggedIn = !!this.authService.getCurrentUser();
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

  playVideo(index) {
    setTimeout(() => {
      this.videoData[index] = true;
      this[`${index}Video`].nativeElement.play();
    }, 400);
  }

  clickGetStarted() {
    if (!this.loggedIn) {
      this.router.navigateByUrl('/onboarding');
    } else {
      this.router.navigateByUrl('/dashboard');
    }
  }

  clickPrintNow() {
    if (!this.loggedIn) {
      this.router.navigateByUrl('/print-now');
    } else {
      this.router.navigateByUrl('/dashboard/publication/create');
    }
  }

  goToLogin() {
    if (!this.loggedIn) {
      // this.router.navigate([{ outlets: { popup: 'login' } }], { queryParamsHandling: 'preserve' });
      this.loginService.loginDialog();
    } else {
      this.router.navigateByUrl('/dashboard');
    }
  }

  startManaging() {
    if (this.authService.getCurrentUser() && this.lastStatusAsManager) {
      const pub = this.lastStatusAsManager.publicationId;
      const issue = this.lastStatusAsManager.issueId;
      const url = `/dashboard/publication/${pub}/issue/${issue}`;
      this.router.navigateByUrl(url);
    } else {
      this.goToLogin();
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
      this.goToLogin();
    }
  }

  goToSponsorSearch() {
    this.router.navigateByUrl('/onboarding/sponsor/searchPublication');
  }

  goTo(str: string) {
    this.pageService.scrollTo(`#${str}`);
  }

  ngOnDestroy() {}
}
