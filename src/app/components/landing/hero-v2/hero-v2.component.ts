import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  OnInit,
  Output,
  PLATFORM_ID,
  ViewChild
} from '@angular/core'; 
import { AnimationEvent, transition, trigger, useAnimation } from '@angular/animations';
import { HelperService } from '_shared/services';
import { horizontalSlideAndScroll, listFadeIn, movieCreditsSlideFromBottomToTop } from '_shared/animations';
import {
  leftToRightSlideAndSlowScrollConfig,
  movieCreditsSlideConfig,
  rightToLeftSlideAndScrollConfig
} from 'components/landing/animationsConfig.ts';
import { Router } from '@angular/router';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { SafeStyle } from '@angular/platform-browser';
import { AuthService } from 'auth/auth.service';
import { role } from '_models';
import { PdfViewerService } from '_shared/services/pdf-viewer.service';
// import { AnimationRenderer } from '@angular/platform-browser/animations/src/animation_renderer';

const assetsArr1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
const assetsArr2 = [30, 32, 14, 15, 16, 17, 18, 19, 20, 21, 22, 2, 4, 5, 6, 7, 8, 9, 10];

const itemWidth = 210;
const itemHeight = 270;
const itemMobileWidth = 141.33;
const itemMobileHeight = 182.01;

@Component({
  selector: 'app-hero-v2',
  templateUrl: './hero-v2.component.html',
  styleUrls: ['./hero-v2.component.scss'],
  animations: [
    trigger('movieCreditsSlide', [
      transition(':enter', useAnimation(movieCreditsSlideFromBottomToTop, movieCreditsSlideConfig))
    ]),
    trigger('listFadeInAnimation', [
      transition('void => *', useAnimation(listFadeIn))
    ]),
    trigger('SlowLeftEnter', [ // toprow
      transition(':enter', useAnimation(horizontalSlideAndScroll, rightToLeftSlideAndScrollConfig))
    ]),
    trigger('SlowRightEnter', [ // bottomrow
      transition(':enter', useAnimation(horizontalSlideAndScroll, leftToRightSlideAndSlowScrollConfig))
    ]),
  ]
})
export class HeroV2Component implements OnInit {
  isMobile;
  isMobileSmall;
  intervalHandler;
  focusWatcherIntervalHandler;
  assetsUrl = environment.heroAssetsUrl;
  assets = {
    first: [...assetsArr1],
    second: [21, 22, 25, 23, 12, 10, 31, 24, 26, 27, 28, 29, 30, ...assetsArr1],
    third: [...assetsArr2]
  };
  rows = {
    main:[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 25, 23, 12, 10, 31, 24, 26, 27, 28, 29, 30],
    first: [],
    second: [],
    third: [],
    fourth: []
  };
  baseDim = {
    itemWidth: itemWidth,
    itemHeight: itemHeight,
    minTextContainerWidthInItems: 2,
    maxTextContainerWidthInItems: 2
  };
  mobileDim = {
    itemWidth: itemMobileWidth,
    itemHeight: itemMobileHeight,
  };
  rowStyles;
  textContainerStyles: SafeStyle;
  firstStateText = false;
  secondStateText = false;
  thirdStateText = false;
  fourthStateText = false;
  rDeact=false;
  lDeact=false;

  // evenRowState: any = false;
  textStateArr: Array<String>;
  // oddRowState: any = false;
  movement = 0;
  currentText = -1;
  textAnimationDelay = 3800;
  @Input() sections;
  @Output() clickedCover = new EventEmitter<any>();
  isBrowser = false;
  private http: HttpClient;
  @ViewChild('firstText', { static: false }) private firstText: ElementRef;
  @ViewChild('secondText', { static: false }) private secondText: ElementRef;
  @ViewChild('thirdText', { static: false }) private thirdText: ElementRef;
  @ViewChild('fourthText', { static: false }) private fourthText: ElementRef;

  constructor(private helper: HelperService,
              private changeDetectorRef: ChangeDetectorRef,
              private authService: AuthService,
              private router: Router,
              handler: HttpBackend,
              @Inject(PLATFORM_ID) private platformId: Object,
             
              /* ,
                     private el: ElementRef,
                     private animationRenderer: AnimationRenderer */
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.http = new HttpClient(handler);
    this.isMobile = window.innerWidth < 840;
    this.isMobileSmall = window.innerWidth < 500;
  }



  ngOnInit() {
    this.setupGrid(); 
  }
  
  
  right(){ 
    if( this.movement < 0 ){
      this.movement = this.movement + (230*1);
    }
    else{
      this.movement = -6900
    }  
  }
  left(){ 
    if( this.movement > -6820 ){
      this.movement = this.movement - (230*1);
    }
    else{
      this.movement = 0;
    } 
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.isMobile = window.innerWidth < 840;
    this.isMobileSmall = window.innerWidth < 500;
    this.setupGrid();
  }

  onTextAnimationEvent(event: AnimationEvent) {
    this.changeDetectorRef.markForCheck();
  }

  openPdf(name: string, textElement?: HTMLElement, element?: HTMLElement, isMobile: boolean = false) {
    if (textElement && element && (this.checkIfOverlaps(textElement, element, true) || isMobile)) {
      return;
    } else {
      this.openPdfViewer(name);
    }
    // this.el.nativeElement
    // .dispatchEvent(new CustomEvent('clickedCover', {
    //   detail: name,
    //   bubbles: true
    // }));
  }

  openPdfViewer(name: string) {
    /*if (this.isMobileSmall) {
      return;
    }*/
    const pdfFile = `${ environment.pdfViewerAssetsUrl + name }.pdf`;
    this.http
      .head(pdfFile)
      .subscribe(
        data => {
          this.clickedCover.emit(pdfFile);
        },
        error => {
        }
      );
  }

  checkIfInside(textElement: HTMLElement, element: HTMLElement) {
    const rect1 = textElement.getBoundingClientRect();
    const rect2 = element.getBoundingClientRect();
    return rect1.top <= rect2.bottom &&
      rect1.bottom >= rect2.top &&
      rect1.left <= rect2.right &&
      rect1.right >= rect2.left;
  }

  checkIfOverlaps(textElement: HTMLElement, element: HTMLElement, cent: boolean = false) {
    const rect1 = textElement.getBoundingClientRect();
    const rect2 = element.getBoundingClientRect();
    if (cent) {
    }
    return !(
      rect1.top > rect2.top ||
      rect1.right < (rect2.left + 100) ||
      rect1.bottom < rect2.bottom ||
      rect1.left > (rect2.right - 100)
    );
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

  private setupGrid() {
    const winCurrentWidth = window.innerWidth;
    let media = (!this.isMobile) ? 'base' : 'mobile';
    media = (!this.isMobileSmall) ? media : 'smallMobile';
    const dim = (media === 'base') ? this.baseDim : this.mobileDim;

    let items = Math.ceil(winCurrentWidth / dim.itemWidth);
    items = items % 2 === 0 ? items : items + 1;
    const marginLeft = ((items * dim.itemWidth) - winCurrentWidth) / 2;
    this.rowStyles = {
      'margin-left': `-${ marginLeft }px`,
      'width': `calc(100% + ${ marginLeft }px)`
    };
    this.setItems(items, 'first');
    this.setItems(items, 'second');
    this.setItems(items, 'third');
    this.rows['fourth'] = [];
    this.setTextContainer(media, items, marginLeft, winCurrentWidth);
  }

  private setItems(itemsCount: number, row: string) {

    if (itemsCount <= this.rows[row].length) {
      return;
    }

    const items = [];
    let index = 0;
    for (let i = 0; i < itemsCount; i++) {
      index = i /*  % 3 */;
      items.push(this.assets[row][index]);
    }

    this.rows[row] = items;
  }

  private setTextContainer(media: string, itemsCount: number, marginLeft: number, currentWinWidth: number) {
    if (media === 'mobile') {
      const height = (this.mobileDim.itemHeight * 2);
      // const width = (this.mobileDim.itemWidth * 3);
      this.textContainerStyles = {
        left: 0,
        width: `100%`,
        top: `${ this.mobileDim.itemHeight }px`,
        height: `${ height }px`,
      };
      return;
    }

    if (media === 'smallMobile') {
      const height = (this.mobileDim.itemHeight * 2);
      // const width = (this.mobileDim.itemWidth * 2.5);
      this.textContainerStyles = {
        left: '0',
        width: `100%`,
        top: `${ this.mobileDim.itemHeight }px`,
        height: `${ height }px`,
      };
      return;
    }

    let itemCountAux = itemsCount;
    if (marginLeft) {
      itemCountAux -= 2;
    }
    let itemsText;
    if (itemCountAux % 2 === 0) {
      itemsText = this.baseDim.minTextContainerWidthInItems;
    } else {
      itemsText = this.baseDim.maxTextContainerWidthInItems;
    }

    const calcWidth = this.baseDim.itemWidth * itemsText;
    const calcHeight = this.baseDim.itemHeight;
    if (calcWidth > currentWinWidth) {
      this.textContainerStyles = {
        left: '0px',
        width: '100%'
      };
    } else {
      const calcItemsToSides = (itemsCount - itemsText) / 2;
      const calcItemsLeft = Math.ceil(calcItemsToSides);

      let calcPxLeft = (calcItemsLeft * this.baseDim.itemWidth) - marginLeft;
      if (itemCountAux % 2 !== 0) {
        calcPxLeft = calcPxLeft - (this.baseDim.itemWidth / 2);
      }

      // currentWinWidth
      this.textContainerStyles = {
        left: calcPxLeft + 'px',
        top: calcHeight + 'px',
        width: calcWidth + 'px',
        height: calcHeight + 'px'
      };
    }
  }
}

