import { isPlatformBrowser } from '@angular/common';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, Inject, OnDestroy, OnInit, Output, PLATFORM_ID, TemplateRef, ViewChild, } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'auth/auth.service';
import { environment } from 'environments/environment';
import { untilDestroyed } from 'ngx-take-until-destroy';

import { DonationLevel, PageAdPricing, PublicationPreview, SubscriptionType, User, } from '_models';
import { DonationSummary } from '_models/donation-summary.model';
import { Donation } from '_models/donation.model';
import { Issue } from '_models/issue.model';
import { SubscriptionSummary } from '_models/subscription-summary.model';
import { Subscription } from '_models/subscription.model';
import {
  AdvertisingService,
  FundraisingService,
  IssueService,
  LoginService,
  PublicationService,
  RequestAccessService,
  SearchService,
} from '_services';
import { CustomCarouselComponent } from '_shared/components';
import { HelperService, PdfViewerService } from '_shared/services';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActionsService } from 'user-dashboard/shared/services';

@Component({
  selector: 'app-publication',
  templateUrl: './publication.component.html',
  styleUrls: ['./publication.component.scss'],
  providers: [FundraisingService, SearchService, IssueService, ActionsService],
})
export class PublicationComponent implements OnInit, AfterViewInit, OnDestroy {
  publication: PublicationPreview;
  currentIssue: Issue;
  currentUser: User;
  loading = true;
  requestSent = '';
  errorMessage = '';
  communityInfo = { title: '', description: '' };
  donations: { donations: Donation[]; summary: DonationSummary };
  subscriptions: {
    subscriptions: Subscription[];
    summary: SubscriptionSummary;
  };
  pageAdsPricing: PageAdPricing[];
  selectedNumberOfIssues: number;
  @Output() clickedCover;
  showPopupPdfViewer;
  showSponsorshipBtn = false;
  showAdvertisingBtn = false;
  showSubscriptionBtn = false;
  assetsUrl = environment.assetsUrl;
  isBrowser = false;
  @ViewChild('selectSubscriptionType', { static: false }) selectSubscriptionType: TemplateRef<unknown>;
  @ViewChild('selectSponsorshipLevel', { static: false }) selectSponsorshipLevel: TemplateRef<unknown>;
  @ViewChild('selectAdType', { static: false }) selectedAdTypeRef: TemplateRef<unknown>;

  previewsObs$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  previews$: Observable<any[]> = this.previewsObs$.asObservable();
  @ViewChild(CustomCarouselComponent, { static: false })
  private previewsCarousel: CustomCarouselComponent;
  private http: HttpClient;

  constructor(
    private requestAccessService: RequestAccessService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private publicationService: PublicationService,
    private fundraisingService: FundraisingService,
    private advertisingService: AdvertisingService,
    private loginService: LoginService,
    private router: Router,
    private helper: HelperService,
    private actionsService: ActionsService,
    private pdfViewerService: PdfViewerService,
    handler: HttpBackend,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.http = new HttpClient(handler);
  }

  ngOnInit() {
    this.route.data.pipe(untilDestroyed(this))
      .subscribe((data) => {
        this.publication = data.publication;
        this.communityInfo = data.publication.communityInfo;
        this.currentUser = data.currentUser;
        // this.initCarousel();
        this.authService.isAuthenticated().subscribe((auth) => {
          if (auth) {
            this.currentUser = this.authService.getCurrentUser();
          } else {
            this.currentUser = null;
          }
        });
        this.fundraisingService
          .getDonations(data.publication.id)
          .subscribe((donations) => {
            this.fundraisingService
              .getSubscriptions(this.publication.id)
              .subscribe((subscriptions) => {
                this.advertisingService
                  .getListPageAdPricings(this.publication.id)
                  .subscribe(async (pageAdsPricing: PageAdPricing[]) => {
                    // this.createForm();
                    this.subscriptions = subscriptions;
                    this.donations = donations;
                    // console.log("TCL: PublicationComponent -> ngOnInit -> this.donations", this.donations);
                    this.pageAdsPricing = pageAdsPricing;
                    if (
                      this.subscriptions &&
                      this.subscriptions.summary.perType.length > 0
                    ) {
                      this.showSubscriptionBtn = true;
                      // TODO: Temporal removal of Self Managed type
                      this.subscriptions.summary.perType = this.subscriptions.summary.perType.filter(
                        (o) => o.subscriptionType.name !== 'Self Managed'
                      );

                      this.showSubscriptionBtn = !!(this.subscriptions.summary && this.subscriptions.summary.perType &&
                        this.subscriptions.summary.perType.length);
                    }
                    if (
                      this.donations &&
                      this.donations.summary &&
                      this.donations.summary.perLevel.length > 0
                    ) {
                      this.showSponsorshipBtn = true;
                    }
                    if (this.pageAdsPricing && this.pageAdsPricing.length > 0) {
                      this.showAdvertisingBtn = true;
                    }
                    this.loading = false;

                    const open = this.route.snapshot.queryParams['open'];
                    this.activate(open);
                  });
              });
          });

        this.previewsObs$.next(this.publication.issuesWithDrafts);
      });
    this.initCarousel();
  }


  ngAfterViewInit() {

  }

  initCarousel() {
    if (this.isBrowser) {
      this.route.data.pipe(untilDestroyed(this)).subscribe(() => {
        // this.previewsCarousel.init();
      });
    }
  }

  log(input: any) {
    // console.log(input);
  }


  goTo(input: string, obj: DonationLevel | SubscriptionType | PageAdPricing) {
    // console.log(obj);
    let url = `publication/${ this.publication.id }/`,
      step = 'register';
    if (this.currentUser) {
      step = 'pay';
    }
    switch (input) {
      case 'ads':
        url += `advertise/${ obj.id }/${ step }`;
        break;
      case 'subs':
        url += `subscribe/${ obj.id }`;
        break;
      case 'sponsor':
        url += `donate/${ obj.id }`;
        break;
      default:
        break;
    }
    console.log('url:', url);
    this.router.navigateByUrl(url);
  }

  activate(input: string) {
    switch (input) {
      case 'ads':
        this.activate('');
        let step = 'register';
        if (this.currentUser) {
          step = 'pay';
        }
        this.actionsService.selectAdvertisementType(this.pageAdsPricing, step);
        break;
      case 'subs':
        this.activate('');
        this.actionsService.selectSubscriptionType(this.subscriptions);
        break;
      case 'sponsor':
        this.activate('');
        this.actionsService.selectSponsorShipLevel(this.publication.id, this.donations);
        break;
      default:
        break;
    }

  }

  goToRegister() {
    this.router.navigateByUrl(
      '/register?request-access=' + this.publication.id
    );
  }

  goToLogin() {
    // this.router.navigate([{ outlets: { popup: 'login' } }], { queryParams: { 'request-access': this.publication.id } });
    this.loginService.loginDialog();
  }

  goToDonate(level: DonationLevel) {
    this.router.navigateByUrl(
      '/publication/' + this.publication.id + '/donate/' + level.id
    );
  }

  openPdf(issue: Issue) {
    this.clickedCover = {
      downloadUrl: issue.coverImage.fileUrl,
      fileUrl: issue.coverImage.previewPdfUrl || issue.coverImage.fileUrl
    };
    this.pdfViewerService.showPdf(this.clickedCover);
  }

  onPdfViewerPopupEvent(evt) {
    if (evt.type === 'popup.closed') {
      this.showPopupPdfViewer = false;
    }
  }

  ngOnDestroy() {
  }
}
