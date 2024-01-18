import {
  AfterViewInit,
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
  Renderer2,
  ViewChild
} from '@angular/core';
import { HelperService } from '_shared/services';
import { Router } from '@angular/router';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from 'auth/auth.service';
import { role } from '_models';

const assetsArr1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
const assetsArr2 = [21, 22, 25, 23, 12, 10, 31, 24, 26, 27, 28, 29, 30, ...assetsArr1];
const assetsArr3 = [30, 32, 14, 15, 16, 17, 18, 19, 20, 21, 22, 2, 4, 5, 6, 7, 8, 9, 10];

@Component({
  selector: 'app-hero-mobile',
  templateUrl: './hero-mobile.component.html',
  styleUrls: ['./hero-mobile.component.scss'],
  animations: []
})
export class HeroMobileComponent implements OnInit, AfterViewInit {
  assetsUrl = environment.heroAssetsUrl;
  assets = [...assetsArr1, ...assetsArr2, ...assetsArr3];

  @Input() sections;
  @Output() clickedCover = new EventEmitter<any>();
  isBrowser = false;
  activeBox = 5;
  private http: HttpClient;
  @ViewChild('sliderContainer', { static: false }) private sliderContainer: ElementRef;
  @ViewChild('sliderItems', { static: false }) private sliderItems: ElementRef;

  constructor(private helper: HelperService,
              private changeDetectorRef: ChangeDetectorRef,
              private authService: AuthService,
              private router: Router,
              private renderer: Renderer2,
              handler: HttpBackend,
              @Inject(PLATFORM_ID) private platformId: Object
              /* ,
                     private el: ElementRef,
                     private animationRenderer: AnimationRenderer */
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.http = new HttpClient(handler);
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  openPdf(name: any) {
    this.openPdfViewer(name);
  }

  openPdfViewer(name: any) {
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

  changeActive(item) {
    this.activeBox = item;
  }

  @HostListener('window:resize')
  onResize() {
  }

}
