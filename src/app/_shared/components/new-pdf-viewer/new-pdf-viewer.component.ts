import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild
} from '@angular/core';
import { PageService } from '_shared/services';
import { Scripts, ScriptService } from '_services/script.service';
import { environment } from 'environments/environment';
import { Intercom } from 'ng-intercom';

declare var $: any;

const ScriptStore: Scripts[] = [
  { name: 'flipbook', src: 'assets/pdf-viewer/js/flipbook.min.js' },
  { name: 'pdf', src: 'assets/pdf-viewer/js/pdf.min.js' },
  { name: 'flipbook.pdfservice', src: 'assets/pdf-viewer/js/flipbook.pdfservice.min.js' },
  { name: 'pdf.worker', src: 'assets/pdf-viewer/js/pdf.worker.min.js' },
  { name: 'iscroll', src: 'assets/pdf-viewer/js/iscroll.min.js' },
  { name: 'three', src: 'assets/pdf-viewer/js/three.min.js' },
  { name: 'flipbook.webgl', src: 'assets/pdf-viewer/js/flipbook.webgl.min.js' },
  { name: 'flipbook.swipe', src: 'assets/pdf-viewer/js/flipbook.swipe.min.js' }
];

@Component({
  selector: 'app-new-pdf-viewer',
  templateUrl: './new-pdf-viewer.component.html',
  styleUrls: ['./new-pdf-viewer.component.scss'],
  providers: [ScriptService]
})
export class NewPdfViewerComponent implements OnInit, OnDestroy {
  assetsUrl = environment.assetsUrl;
  @Input() pdfDocument: { fileUrl, downloadUrl? };
  @Input() icons: string;
  @Input() lightBox: boolean;
  @Output() viewerEvent = new EventEmitter<any>();
  @Output() closePopupEvent = new EventEmitter<any>();
  @ViewChild('pdfViewer', { static: false }) private pdfViewer: ElementRef;

  constructor(
    private pageService: PageService,
    private scriptService: ScriptService,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private intercom: Intercom,
    private ngZone: NgZone,
  ) {
    this.scriptService.init(ScriptStore);
    this.initScripts().then(() => {
      this.viewerEvent.emit({
        type: 'flipbook.loaded'
      });
    });
  }

  _showPopup = false;

  @Input()
  set showPopup(val: boolean) {
    this._showPopup = val;
    if (this._showPopup) {
      // this.renderer.addClass(this.elementRef.nativeElement, 'show');
      this.initFlipBook();
      this.intercom.update({ hide_default_launcher: true });
    } else {
      // this.renderer.removeClass(this.elementRef.nativeElement, 'show');
    }
  }

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.closePopup();
  }

  ngOnInit() {


    this.ngZone.run(() => {
      if (this.lightBox) {
        $('body').on(
          'click',
          '.flipbook-menu [data-name="btnClose"]',
          (e) => {
            this.closePopup();
          });
      }
    });
  }

  closePopup() {
    this._showPopup = false;
    this.intercom.update({ hide_default_launcher: false });
    URL.revokeObjectURL(this.pdfDocument.downloadUrl);
    this.viewerEvent.emit({ type: 'popup.closed' });
    this.closePopupEvent.emit();
  }

  async initScripts() {
    // await this.scriptService.load('flipbook');
    /*await this.scriptService.load('pdf');
    await this.scriptService.load('flipbook.pdfservice');
    await this.scriptService.load('pdf.worker');
    await this.scriptService.load('iscroll');
    await this.scriptService.load('three');
    await this.scriptService.load('flipbook.webgl');
    await this.scriptService.load('flipbook.swipe');*/
  }

  initFlipBook() {
    $(document).ready(() => {
      $('#pdfViewer').flipBook({
        skin: 'darkgrey',
        // menu2Background: 'transparent',
        // btnBackground: 'transparent',
        floatingBtnBackground: 'transparent',
        menu2Background: 'linear-gradient(rgba(0, 0, 0, 0.65) 0%, transparent 100%)',
        // menu2Transparent: true,
        menu2OverBook: true,
        pdfUrl: this.pdfDocument.fileUrl,
        lightBox: this.lightBox,
        lightBoxOpened: true,
        lightboxBackground: 'rgb(81, 85, 88, 0.8)',
        backgroundColor: 'rgb(81, 85, 88, 0.8)',
        backgroundTransparent: false,
        btnColor: '#0dd4db',
        sideBtnColor: '#0dd4db',
        floatingBtnColor: '#0dd4db',
        currentPage: { color: '#0dd4db', },
        btnBookmark: { enabled: false },
        btnSound: { enabled: false },
        btnSelect: { enabled: false, icon: 'fas fa-mouse-pointer' },
        btnToc: { enabled: false },
        btnDownloadPages: { enabled: false },
        btnDownloadPdf: {
          enabled: true,
          url: this.pdfDocument.downloadUrl,
          icon: 'fa-download',
          icon2: 'file_download',
          // forceDownload: true,
          openInNewWindow: true,
        },
        btnShare: { enabled: false },
        btnPrint: { enabled: false },
        btnAutoplay: { enabled: true },
        btnClose: {
          enabled: true,
        },
        viewMode: 'webgl',
        layout: 3,
        twitter: { enabled: false },
        facebook: {
          icon: 'fab fa-facebook-f',
          app_id: '637976876540961',
          url: this.pdfDocument.fileUrl,
        },
        google_plus: { enabled: false },
        pinterest: { enabled: false },
        icons: this.icons,
        // icons: 'material',
        zoomStep: 1.5,
        sideBtnSize: 60,
        btnSize: 16,
        // pageTextureSize: 720,
        // pageTextureSizeSmall: 720
      });
    });
  }

  ngOnDestroy() {
  }

}
