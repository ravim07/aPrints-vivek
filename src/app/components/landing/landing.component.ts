import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from 'auth/auth.service';
import { environment } from 'environments/environment';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { from, Observable } from 'rxjs';
import { Review, role } from '_models';
import { Publication } from '_models/publication.model';
import { PublicationService, ReviewService } from '_services';
import { CustomCarouselComponent } from '_shared/components';
import { HelperService, PageService, PdfViewerService } from '_shared/services';
import { ReviewDialogComponent } from './review-dialog.component';
import { VideoPopupComponent } from './video-popup/video-popup.component';

declare var $: any;

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  providers: [ReviewService, PublicationService],
})
export class LandingComponent implements OnInit, OnDestroy, AfterViewInit {
  // @ViewChild('videoYoutube', { static: false }) video: any;
  videoData = {
    youtubeId: 'U4fQscbRlqk',
    showVideo: false,
  };
  @ViewChild('pricing', { static: false }) pricing: ElementRef;

  reviews$: Observable<Review[]>;
  publications: Publication[] = [];
  trendy: Publication[] = [];
  school: Publication[] = [];
  church: Publication[] = [];
  other: Publication[] = [];
  reviewDelay = 5000;
  bannerDelay = 5000;
  sections;
  showPopupPdfViewer;
  clickedCover;
  assetsUrl = environment.assetsUrl;
  isBrowser = false;
  windowsSize = window.screen;
  windowWidth = window.innerWidth;
  topImage = `${this.assetsUrl}/images/new-design/top.png`;
  isAuthenticated$: Observable<boolean>;
  isMobile;
  @ViewChild('reviewCarousel', { static: false })
  private reviewCarousel: CustomCarouselComponent;

  @ViewChild('topBannerCarousel', { static: false })
  private topBannerCarousel: CustomCarouselComponent;

  topBannerCarouselItems = [
    {
      image: `${this.assetsUrl}/images/new-design/top.png`,
      caption: 'Great Content and Stunning Print Quality, Cover to Cover',
      type: 'basic',
    },
    {
      image: `${this.assetsUrl}/images/new-design/kids.png`,
      caption: 'Your school has stories to tell.',
      smallCaption: { accented: 'Be the one', normal: 'who makes it happen.' },
      icon: `${this.assetsUrl}/images/new-design/pencil-icon.png`,
      type: 'composite',
    },
    {
      image: `${this.assetsUrl}/images/new-design/people.png`,
      caption: 'Your nonprofit is changing lives.',
      smallCaption: { accented: 'Be the one', normal: 'who tells the story.' },
      icon: `${this.assetsUrl}/images/new-design/family-icon.png`,
      type: 'composite',
    },
    {
      image: `${this.assetsUrl}/images/new-design/couple.png`,
      caption: 'Your community is resilient.',
      smallCaption: { accented: 'Be the one', normal: 'who recognizes them.' },
      icon: `${this.assetsUrl}/images/new-design/heart-icon.png`,
      type: 'composite',
    },
  ];

  constructor(
    public dialog: MatDialog,
    private rs: ReviewService,
    public router: Router,
    private authService: AuthService,
    private helper: HelperService,
    private pageService: PageService,
    private pdfViewerService: PdfViewerService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this.isAuthenticated$ = this.authService.isAuthenticated();
    this.sections = {
      second: this.pricing,
    };
    this.initReviews();
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      this.initBanner();
      this.initReviews();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.windowWidth = window.innerWidth;
    this.topBannerCarousel.setItemWidth(this.windowWidth);
    this.topBannerCarousel.carouselWrapperStyle = {
      width: `${this.topBannerCarousel.getItemWidth()}px`,
    };
  }

  popup(data) {
    const dialogRef = this.dialog.open(ReviewDialogComponent, {
      width: '440px',
      data: data,
      panelClass: 'app-panel-review-dialog',
    });

    dialogRef
      .afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe((result) => {
        console.log('The dialog was closed');
      });
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

  clickPrintNow() {
    if (!this.authService.getCurrentUser()) {
      this.router.navigateByUrl('/print-now');
    } else {
      this.router.navigateByUrl('/dashboard/publication/create');
    }
  }

  // TODO: FIX THIS, this is related to silent error shown in log when logging in
  initReviews() {
    this.reviews$ = from(this.rs.getAllReviews());
    this.reviews$.pipe(untilDestroyed(this)).subscribe(async (data) => {
      await this.helper.timeout(400);
      const items = await this.reviewCarousel.getItemsElements();
      if (items.first) {
        this.reviewCarousel.setItemWidth(
          await items.first.nativeElement.getBoundingClientRect().width
        );
        this.reviewCarousel.carouselWrapperStyle = {
          width: `${this.reviewCarousel.getItemWidth()}px`,
        };
        this.helper.setIntervalAsync(async () => {
          if (document.hasFocus()) {
            this.reviewCarousel.next();
            await this.helper.delayReport(this.reviewDelay);
          }
        }, 1);
      }
    });
  }

  // TODO: FIX THIS, this is related to silent error shown in log when logging in
  initBanner() {
    console.log(this.topBannerCarousel);
    this.topBannerCarousel.setItemWidth(this.windowWidth);
    this.topBannerCarousel.carouselWrapperStyle = {
      width: `${this.topBannerCarousel.getItemWidth()}px`,
    };
    this.helper.setIntervalAsync(async () => {
      if (document.hasFocus()) {
        this.topBannerCarousel.next();
        await this.helper.delayReport(this.bannerDelay);
      }
    }, 1);
  }

  openPdf($event: string) {
    this.clickedCover = $event;
    this.showPopupPdfViewer = true;
    this.pdfViewerService.showPdf({ fileUrl: $event, downloadUrl: $event });
  }

  onPdfViewerPopupEvent(evt) {
    if (evt.type === 'popup.closed') {
      this.showPopupPdfViewer = false;
    }
  }

  videoPopup() {
    const dialogRef = this.dialog.open(VideoPopupComponent, {
      width: '100%',
      height: '85%',
      data: {
        type: 'youtube',
        youtubeId: this.videoData.youtubeId,
      },
      panelClass: 'video-dialog',
    });

    dialogRef
      .afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe((result) => {
        console.log('The dialog was closed');
      });
  }

  scrollTo(target) {
    this.pageService.scrollTo(target, 800, 70);
  }

  ngOnDestroy(): void {
    this.helper.killEmAll();
  }
}
