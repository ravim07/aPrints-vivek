import {
  AnimationEvent,
  transition,
  trigger,
  useAnimation,
} from '@angular/animations';
import { isPlatformBrowser } from '@angular/common';
import { HttpBackend, HttpClient } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { SafeStyle } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import {
  leftToRightSlideAndSlowScrollConfig,
  movieCreditsSlideConfig,
  rightToLeftSlideAndScrollConfig,
} from 'components/landing/animationsConfig.ts';
import { environment } from 'environments/environment';
import {
  horizontalSlideAndScroll,
  listFadeIn,
  movieCreditsSlideFromBottomToTop,
} from '_shared/animations';
import { HelperService } from '_shared/services';
// import { AnimationRenderer } from '@angular/platform-browser/animations/src/animation_renderer';

const assetsArr1 = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
];
const assetsArr2 = [
  30, 31, 14, 15, 16, 17, 18, 19, 20, 21, 22, 2, 4, 5, 6, 7, 8, 9, 10,
];

const itemWidth = 157.5;
const itemHeight = 201.75;
const itemMobileWidth = 106;
const itemMobileHeight = 136;

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
  animations: [
    trigger('movieCreditsSlide', [
      transition(
        ':enter',
        useAnimation(movieCreditsSlideFromBottomToTop, movieCreditsSlideConfig)
      ),
    ]),
    trigger('listFadeInAnimation', [
      transition('void => *', useAnimation(listFadeIn)),
    ]),
    trigger('SlowLeftEnter', [
      // toprow
      transition(
        ':enter',
        useAnimation(horizontalSlideAndScroll, rightToLeftSlideAndScrollConfig)
      ),
    ]),
    trigger('SlowRightEnter', [
      // bottomrow
      transition(
        ':enter',
        useAnimation(
          horizontalSlideAndScroll,
          leftToRightSlideAndSlowScrollConfig
        )
      ),
    ]),
  ],
})
export class HeroComponent implements OnInit, OnDestroy {
  private http: HttpClient;
  isMobile;
  intervalHandler;
  focusWatcherIntervalHandler;
  assetsUrl = environment.heroAssetsUrl;
  assets = {
    // first: [5, 6, 7, 10, 1, 2, 3, 4, 5, 6, 7, 15, 16, 17, 18, 19, 20, 1],
    // second: [8, 9, 10, 11, 15, 16, 17, 12, 13, 14, 4, 5, 6, 7],
    // third: [15, 16, 17, 18, 19, 20, 1, 8, 3, 14, 5, 2, 4, 6],
    // fourth: [1, 2, 4, 3, 6, 7, 8, 9, 10, 11, 12, 13, 14, 21, 16, 9, 10, 11, 12]
    // first: [1, 2, 3, 4, 5, 6, 7, 15, 16, 17, 18, 19, 20,],
    // second: [8, 9, 10, 11, 12, 13, 14, 1, 2, 3, 4, 5, 6, 7],
    // third: [15, 16, 17, 18, 19, 20, 1, 8, 9, 10, 11, 12, 13, 14]
    first: [...assetsArr1],
    second: [
      21,
      22,
      25,
      23,
      12,
      10,
      31,
      24,
      26,
      27,
      28,
      29,
      30,
      31,
      ...assetsArr1,
    ],
    third: [...assetsArr2],
  };
  rows = {
    first: [],
    second: [],
    third: [],
    fourth: [],
  };
  baseDim = {
    itemWidth: itemWidth,
    itemHeight: itemHeight,
    minTextContainerWidthInItems: 3,
    maxTextContainerWidthInItems: 4,
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
  // oddRowState: any = false;
  // evenRowState: any = false;
  textStateArr: Array<String>;
  currentText = -1;
  textAnimationDelay = 3800;
  @ViewChild('firstText', { static: false }) private firstText: ElementRef;
  @ViewChild('secondText', { static: false }) private secondText: ElementRef;
  @ViewChild('thirdText', { static: false }) private thirdText: ElementRef;
  @ViewChild('fourthText', { static: false }) private fourthText: ElementRef;
  @Input() sections;
  @Output() clickedCover = new EventEmitter<any>();
  isBrowser = false;

  constructor(
    private helper: HelperService,
    private changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    handler: HttpBackend,
    @Inject(PLATFORM_ID) private platformId: Object /* ,
              private el: ElementRef,
              private animationRenderer: AnimationRenderer */
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.http = new HttpClient(handler);
    this.isMobile = window.innerWidth < 768;
  }

  ngOnInit() {
    this.setupGrid();
    if (this.isBrowser) {
      this.setFocusWatcher();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setupGrid();
  }

  private setupGrid() {
    const winCurrentWidth = window.innerWidth;
    const media = !this.isMobile ? 'base' : 'mobile';
    const dim = media === 'base' ? this.baseDim : this.mobileDim;

    const items = Math.ceil(winCurrentWidth / dim.itemWidth); // + 1;
    const marginLeft = (items * dim.itemWidth - winCurrentWidth) / 2;

    this.rowStyles = {
      'margin-left': `-${marginLeft}px`,
      width: `calc(100% + ${marginLeft}px)`,
    };
    this.setItems(items, 'first');
    this.setItems(items, 'second');
    this.setItems(items, 'third');
    this.rows['fourth'] = [];
    this.setTextContainer(media, items, marginLeft, winCurrentWidth);
  }

  private setupHeroAnimations() {
    this.textStateArr = [
      'firstStateText',
      'secondStateText',
      'thirdStateText',
      'fourthStateText',
    ];
    this.intervalHandler = this.helper.setIntervalAsync(async () => {
      if (document.hasFocus()) {
        this.next();
        await this.helper.delayReport(this.textAnimationDelay);
      } else {
        this.clearIntervalHandler();
      }
    }, 1);
  }

  setFocusWatcher(set = true) {
    if (set) {
      this.focusWatcherIntervalHandler = setInterval(() => {
        if (document.hasFocus()) {
          if (!this.intervalHandler) {
            this.setupHeroAnimations();
          }
        } else {
          this.clearIntervalHandler();
        }
      }, 300);
    } else {
      if (this.focusWatcherIntervalHandler) {
        clearInterval(this.focusWatcherIntervalHandler);
      }
    }
  }

  private next() {
    if (this.currentText + 1 === this.textStateArr.length) {
      this.currentText = -1;
    }
    this.currentText = this.currentText + 1;
    const elem = this.textStateArr[this.currentText];
    const before = this.currentText - 2;
    console.log('Animation running!');
    if (before > -1) {
      this[this.textStateArr[before].toString()] = false;
    } else if (before === -1) {
      this[this.textStateArr[this.textStateArr.length - 1].toString()] = false;
    } else if (before === -2) {
      this[this.textStateArr[this.textStateArr.length - 2].toString()] = false;
    }
    this[elem.toString()] = true;
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

  private setTextContainer(
    media: string,
    itemsCount: number,
    marginLeft: number,
    currentWinWidth: number
  ) {
    if (media === 'mobile') {
      this.textContainerStyles = {
        left: '0px',
        width: '100%',
      };
      return;
    }

    let itemCountAux = itemsCount;
    if (marginLeft) {
      itemCountAux -= 2;
    }

    let itemsText;
    if (itemCountAux % 2 === 0) {
      itemsText = this.baseDim.maxTextContainerWidthInItems;
    } else {
      itemsText = this.baseDim.minTextContainerWidthInItems;
    }

    const calcWidth = this.baseDim.itemWidth * itemsText;
    if (calcWidth > currentWinWidth) {
      this.textContainerStyles = {
        left: '0px',
        width: '100%',
      };
    } else {
      const calcItemsLeft = Math.ceil((itemsCount - itemsText) / 2);
      const calcPxLeft = calcItemsLeft * this.baseDim.itemWidth - marginLeft;

      this.textContainerStyles = {
        left: calcPxLeft + 'px',
        width: calcWidth + 'px',
      };
    }
  }

  onTextAnimationEvent(event: AnimationEvent) {
    this.changeDetectorRef.markForCheck();
  }

  ngOnDestroy() {
    this.clearIntervalHandler();
    this.setFocusWatcher(false);
    this.helper.killEmAll();
  }

  clearIntervalHandler() {
    if (this.intervalHandler) {
      clearInterval(this.intervalHandler);
      this.stopAllAnimations();
    }
  }

  stopAllAnimations() {
    const elem = this.textStateArr[this.currentText];
    this[elem.toString()] = false;
    this.textStateArr.map((i) => {
      this[i.toString()] = false;
      return;
    });
    /* const animationPlayers = this.animationRenderer.engine.players;
    console.log(animationPla1yers);
    // find trigger you want to have control over
    animationPlayers.map((p) => {
      p.destroy();
    }); */
  }

  openPdf(
    name: string,
    textElement?: HTMLElement,
    element?: HTMLElement,
    isMobile: boolean = false
  ) {
    if (
      textElement &&
      element &&
      (this.checkIfOverlaps(textElement, element, true) || isMobile)
    ) {
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
    const pdfFile = `${environment.pdfViewerAssetsUrl + name}.pdf`;
    this.http.head(pdfFile).subscribe(
      (data) => {
        this.clickedCover.emit(pdfFile);
      },
      (error) => {
        // console.log(error);
      }
    );
  }

  checkIfInside(textElement: HTMLElement, element: HTMLElement) {
    const rect1 = textElement.getBoundingClientRect();
    const rect2 = element.getBoundingClientRect();
    return (
      rect1.top <= rect2.bottom &&
      rect1.bottom >= rect2.top &&
      rect1.left <= rect2.right &&
      rect1.right >= rect2.left
    );
  }

  checkIfOverlaps(
    textElement: HTMLElement,
    element: HTMLElement,
    cent: boolean = false
  ) {
    const rect1 = textElement.getBoundingClientRect();
    const rect2 = element.getBoundingClientRect();
    if (cent) {
      // console.log(rect1, rect2);
    }
    return !(
      rect1.top > rect2.bottom ||
      rect1.right < rect2.left + 100 ||
      rect1.bottom < rect2.top ||
      rect1.left > rect2.right - 100
    );
  }
}
