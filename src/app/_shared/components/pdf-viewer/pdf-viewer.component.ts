import { Component, Input, EventEmitter, Output, HostListener, ElementRef, ViewChild } from '@angular/core';
import { PageService } from '_shared/services';
import { ScriptService, Scripts } from '_services/script.service';
declare var $: any;
import { environment } from 'environments/environment';

const ScriptStore: Scripts[] = [
  {name: 'flipbook', src: 'assets/pdf-viewer/js/flipbook.min.js'},
  {name: 'pdf', src: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.0.943/pdf.min.js'},
  {name: 'flipbook.pdfservice', src: 'assets/pdf-viewer/js/flipbook.pdfservice.min.js'},
  {name: 'pdf.worker', src: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.0.943/pdf.worker.min.js'},
  {name: 'iscroll', src: 'assets/pdf-viewer/js/iscroll.min.js'},
  {name: 'three', src: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/100/three.min.js'},
  {name: 'flipbook.webgl', src: 'assets/pdf-viewer/js/flipbook.webgl.min.js'}
];

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss'],
  providers: [ScriptService]
})
export class PdfViewerComponent {
  assetsUrl = environment.assetsUrl;
  @Input()
  clickedCover;
  @Output()
  popupEvent = new EventEmitter<any>();
  _showPopup = false;
  popupClass = '';
  @ViewChild('pdfViewer', {static: false}) private pdfViewer: ElementRef;

  constructor(
    private pageService: PageService,
    private scriptService: ScriptService
  ) {
    this.scriptService.init(ScriptStore);
    this.initScripts();
  }

  @Input()
  set showPopup(val: boolean) {
    this._showPopup = val;
    if (this._showPopup) {
      const url = this.clickedCover;
      $(document).ready(function () {
        $('#pdfViewer').flipBook({
            pdfUrl: url,
            btnSound: {enabled: false},
            btnToc: {enabled: false},
            btnDownloadPages: {enabled: false},
            btnDownloadPdf: {enabled: false},
            btnShare:  {enabled: false},
            btnAutoplay: {enabled: false},
        });
      });
      this.popupClass = 'modal-show';
      this.pageService.addBodyClass('modal-open');
    } else {
      this.popupClass = '';
      this.pageService.removeBodyClass('modal-open');
    }
  }

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.closePopup();
  }

  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (this.pdfViewer) {
      if (event.target.contains(this.pdfViewer.nativeElement)) {
        this.closePopup();
      }
    }
  }

  closePopup() {
    this._showPopup = false;
    this.popupClass = '';
    this.pageService.removeBodyClass('modal-open');
    this.popupEvent.emit({ type: 'popup.closed'});
  }

  async initScripts () {
    await this.scriptService.load('flipbook');
    // await this.scriptService.load('pdf');
    // await this.scriptService.load('flipbook.pdfservice');
    // await this.scriptService.load('pdf.worker');
    // await this.scriptService.load('iscroll');
    // await this.scriptService.load('three');
    // await this.scriptService.load('flipbook.webgl');
  }
}
