import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { issueStatus, PublicationPreview } from '_models';
import { Issue } from '_models/issue.model';
import { Scripts, ScriptService } from '_services';

declare var $: any;

const ScriptStore: Scripts[] = [
  { name: 'flipbook', src: 'assets/pdf-viewer/js/flipbook.min.js' },
  { name: 'pdf', src: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.0.943/pdf.min.js' },
  { name: 'flipbook.pdfservice', src: 'assets/pdf-viewer/js/flipbook.pdfservice.min.js' },
  { name: 'pdf.worker', src: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.0.943/pdf.worker.min.js' },
  { name: 'iscroll', src: 'assets/pdf-viewer/js/iscroll.min.js' },
  { name: 'three', src: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/100/three.min.js' },
  { name: 'flipbook.webgl', src: 'assets/pdf-viewer/js/flipbook.webgl.min.js' }
];

@Component({
  selector: 'app-publication-issue-preview',
  templateUrl: './publication-issue-preview.component.html',
  styleUrls: ['./publication-issue-preview.component.scss']
})
export class PublicationIssuePreviewComponent implements OnInit {
  publication: PublicationPreview;
  issue: Issue;
  sidebarDetailsOpen = false;
  pdfUrl;
  currentPdfPage = 1;
  pdfViewer;

  issuesRelated: any[] = [];

  constructor(private route: ActivatedRoute, private scriptService: ScriptService) {
    this.scriptService.init(ScriptStore);
    this.initScripts();
  }

  ngOnInit() {
    this.route.data.subscribe(async (data) => {
      setTimeout(() => {
        this.publication = data.publication;
        this.issue = data.issue;
        this.issuesRelated = this.publication.issuesWithDrafts.filter((issue) => {
          return [
            issueStatus.draftAccepted,
            issueStatus.draftSubmittedForPrintSchedule,
            issueStatus.pricingInReview,
            issueStatus.pricingConfirmed,
            issueStatus.printingDataConfirmed,
            issueStatus.issueShipped,
            issueStatus.issueDelivered,
            issueStatus.paymentSubmitted,
          ].includes(issue.status) && issue.id !== this.issue.id;
        });
        this.pdfUrl = data.issue.coverImage.previewPdfUrl || data.issue.coverImage.fileUrl;
        this.initViewer(this.pdfUrl);
      }, 0);
    });
  }

  initViewer(pdfUrl) {
    $(document).ready(() => {
      this.pdfViewer = $('#pdfViewer').flipBook({
        pdfUrl: pdfUrl,
        skin: 'darkgrey',
        // menu2Background: 'transparent',
        // btnBackground: 'transparent',
        floatingBtnBackground: 'transparent',
        menu2Background: 'linear-gradient(rgba(0, 0, 0, 0.65) 0%, transparent 100%)',
        // menu2Transparent: true,
        menu2OverBook: true,
        // pdfUrl: this.pdfDocument.downloadUrl,
        // lightBox: this.lightBox,
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
          url: this.issue.coverImage.fileUrl,
          icon: 'fa-download',
          icon2: 'file_download',
          forceDownload: true,
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
          // url: this.pdfDocument.fileUrl,
        },
        google_plus: { enabled: false },
        pinterest: { enabled: false },
        // icons: this.icons,
        // icons: 'material',
        zoomStep: 1.5,
        sideBtnSize: 60,
        btnSize: 16,
        // pageTextureSize: 720,
        // pageTextureSizeSmall: 720
      });
    });
  }

  toggleSideDetails() {
    this.sidebarDetailsOpen = !this.sidebarDetailsOpen;
    this.resizePdfViewer();
  }

  resizePdfViewer() {
    setTimeout(() => {
      this.pdfViewer.resize();
    }, 100);
  }

  async initScripts() {
    await this.scriptService.load('flipbook');
    // await this.scriptService.load('pdf');
    // await this.scriptService.load('flipbook.pdfservice');
    // await this.scriptService.load('pdf.worker');
    // await this.scriptService.load('iscroll');
    // await this.scriptService.load('three');
    // await this.scriptService.load('flipbook.webgl');
  }

}
