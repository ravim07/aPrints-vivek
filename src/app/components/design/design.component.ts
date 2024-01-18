// import { AfterViewInit, Component, HostListener, Inject, OnDestroy, OnInit, Output, PLATFORM_ID, ViewChild } from '@angular/core';
// import { environment } from 'environments/environment';
// import { HttpBackend, HttpClient } from '@angular/common/http';
// import { isPlatformBrowser } from '@angular/common';
// import { PageService } from '_shared/services';
// import { VideoPopupComponent } from 'components/landing/video-popup/video-popup.component';
// import { untilDestroyed } from 'ngx-take-until-destroy';
// import { MatDialog } from '@angular/material/dialog';
// import { ActivatedRoute, Router } from '@angular/router';
// import { CarouselComponent } from 'angular-responsive-carousel';
// import { PdfViewerService } from '_shared/services';

// // declare var Isotope: any;
// declare var $: any;

// @Component({
//   selector: 'app-design',
//   templateUrl: './design.component.html',
//   styleUrls: ['./design.component.scss']
// })
// export class DesignComponent implements OnInit, AfterViewInit, OnDestroy {
//   assetsUrl = environment.assetsUrl;
//   // assetsUrl = '/assets/img/';
//   @Output() clickedCover;
//   showPopupPdfViewer;
//   pdfFolder = `${ environment.assetsUrl }/template-pdfs/`;

//   isBrowser = false;
//   activeSection = '#templates';
//   templatesPdfs = [
//     {
//       category: 'alternative',
//       templateImage: 'Alternative.png',
//       templatePreview: 'Alternative.pdf',
//       templateUrl: 'Alternative.zip',
//     },
//     {
//       category: 'classic',
//       templateImage: 'Classic.png',
//       templatePreview: 'Classic.pdf',
//       templateUrl: 'Classic.zip',
//     },
//     {
//       category: 'edgy',
//       templateImage: 'Edgy.png',
//       templatePreview: 'Edgy.pdf',
//       templateUrl: 'Edgy.zip',
//     },
//     {
//       category: 'modern',
//       templateImage: 'Modern.png',
//       templatePreview: 'Modern.pdf',
//       templateUrl: 'Modern.zip',
//     },
//     {
//       category: 'traditional',
//       templateImage: 'Traditional.png',
//       templatePreview: 'Traditional.pdf',
//       templateUrl: 'Traditional.zip',
//     },
//     {
//       templateImage: 'Art_Magazine_Letter_Size.jpg',
//       templatePreview: 'Art_Magazine_Letter_Size.pdf',
//       templateUrl: 'Art_Magazine_Letter_Size.zip'
//     },
//     {
//       templateImage: 'Beauty_Magazine_TemplateUS.jpg',
//       templatePreview: 'Beauty_Magazine_TemplateUS.pdf',
//       templateUrl: 'Beauty_Magazine_TemplateUS.zip'
//     },
//     {
//       templateImage: 'College_Magazine_TemplateUS.jpg',
//       templatePreview: 'College_Magazine_TemplateUS.pdf',
//       templateUrl: 'College_Magazine_TemplateUS.zip'
//     },
//     {
//       templateImage: 'Creative_Church_Magazine_TemplateUS.jpg',
//       templatePreview: 'Creative_Church_Magazine_TemplateUS.pdf',
//       templateUrl: 'Creative_Church_Magazine_TemplateUS.zip'
//     },
//     {
//       templateImage: 'Creative_Magazine_A4_US.jpg',
//       templatePreview: 'Creative_Magazine_A4_US.pdf',
//       templateUrl: 'Creative_Magazine_A4_US.zip'
//     },
//     {
//       templateImage: 'Editable_Entertainment_Magazine_Template_Us.jpg',
//       templatePreview: 'Editable_Entertainment_Magazine_Template_Us.pdf',
//       templateUrl: 'Editable_Entertainment_Magazine_Template_Us.zip'
//     },
//     {
//       templateImage: 'Fitness_Magazine_Template_US.jpg',
//       templatePreview: 'Fitness_Magazine_Template_US.pdf',
//       templateUrl: 'Fitness_Magazine_Template_US.zip'
//     },
//     {
//       templateImage: 'Food_Magazine_Template_US.jpg',
//       templatePreview: 'Food_Magazine_Template_US.pdf',
//       templateUrl: 'Food_Magazine_Template_US.zip'
//     },
//     {
//       templateImage: 'Magazine_Clothing.jpg',
//       templatePreview: 'Magazine_Clothing.pdf',
//       templateUrl: 'Magazine_Clothing.zip'
//     },
//     {
//       templateImage: 'Magazine_Travel.jpg',
//       templatePreview: 'Magazine_Travel.pdf',
//       templateUrl: 'Magazine_Travel.zip'
//     },
//     {
//       templateImage: 'Printable_Music_Magazine_TemplateUS.jpg',
//       templatePreview: 'Printable_Music_Magazine_TemplateUS.pdf',
//       templateUrl: 'Printable_Music_Magazine_TemplateUS.zip'
//     },
//     {
//       templateImage: 'Professional_travel_magazine_templateUS.jpg',
//       templatePreview: 'Professional_travel_magazine_templateUS.pdf',
//       templateUrl: 'Professional_travel_magazine_templateUS.zip'
//     },
//     {
//       templateImage: 'Restaurant_Magazine_Template(new).jpg',
//       templatePreview: 'Restaurant_Magazine_Template(new).pdf',
//       templateUrl: 'Restaurant_Magazine_Template(new).zip'
//     },
//     {
//       templateImage: 'Rock_Music_Magazine_TemplateUS.jpg',
//       templatePreview: 'Rock_Music_Magazine_TemplateUS.pdf',
//       templateUrl: 'Rock_Music_Magazine_TemplateUS.zip'
//     },
//     {
//       templateImage: 'Simple_Magazine_Template_Lettersize.jpg',
//       templatePreview: 'Simple_Magazine_Template_Lettersize.pdf',
//       templateUrl: 'Simple_Magazine_Template_Lettersize.zip'
//     },
//     {
//       templateImage: 'Sports_Magazine_Template_US.jpg',
//       templatePreview: 'Sports_Magazine_Template_US.pdf',
//       templateUrl: 'Sports_Magazine_Template_US.zip'
//     },
//     {
//       templateImage: 'Student_Magazine_Template_US.jpg',
//       templatePreview: 'Student_Magazine_Template_US.pdf',
//       templateUrl: 'Student_Magazine_Template_US.zip'
//     },
//     {
//       templateImage: 'wedding_magazine_template_US.jpg',
//       templatePreview: 'wedding_magazine_template_US.pdf',
//       templateUrl: 'wedding_magazine_template_US.zip'
//     },
//     /*    {
//           // templateImage: 'wedding_magazine_template_US.jpg',
//           // templatePreview: 'wedding_magazine_template_US.pdf',
//           // templateUrl: 'wedding_magazine_template_US.zip'
//         },*/
//   ];
//   filteredTemplates;
//   activeFilter = 'all';
//   @ViewChild('carouselComponentDesktop', { static: false, }) carouselComponentDesktop: CarouselComponent;
//   @ViewChild('carouselComponentMobile', { static: false, }) carouselComponentMobile: CarouselComponent;

//   isoTope;
//   carouselSettings;
//   carouselItems = [];
//   private http: HttpClient;

//   constructor(handler: HttpBackend,
//               private pageService: PageService,
//               private dialog: MatDialog,
//               private router: Router,
//               private route: ActivatedRoute,
//               private pdfViewerService: PdfViewerService,
//               @Inject(PLATFORM_ID) private platformId: Object) {
//     this.isBrowser = isPlatformBrowser(this.platformId);
//     this.http = new HttpClient(handler);
//   }

//   _isMobile: boolean;

//   get isMobile() {
//     return this._isMobile;
//   }

//   set isMobile(value) {
//     const initCarouselEvent = this._isMobile !== value;
//     this._isMobile = value;
//     if (initCarouselEvent) {
//       this.initCarouselDotEvent();
//     }
//   }

//   ngOnInit() {
//     this.filteredTemplates = this.templatesPdfs;
//     this.checkForMobile();
//     this.generateDesktopCarouselItems();
//     this.scrollableSetup();
//   }

//   checkForMobile() {
//     if (this.isBrowser) {
//       this.isMobile = window.innerWidth < 960;
//     }
//   }

//   ngOnDestroy() {
//   }

//   ngAfterViewInit() {
//     console.log('ngAfterViewInit');
//     setTimeout(() => {
//       /*this.isoTope = new Isotope('.templates-carousel', {
//         itemSelector: 'body .template-item',
//         // layoutMode: 'fitRows'
//       });*/

//       this.initCarouselDotEvent();
//     }, 200);
//   }

//   initCarouselDotEvent() {
//     const carouselComponent = this.isMobile ? this.carouselComponentMobile : this.carouselComponentDesktop;
//     $('body').find('.carousel-container .carousel-dot').on('click', ($e) => {
//       const index = $($e.target).index();
//       if (carouselComponent.slide.counter === index) {
//         return;
//       }

//       let lengthScroll = 0;
//       if (carouselComponent.slide.counter < index) {
//         lengthScroll = index - carouselComponent.slide.counter;
//         carouselComponent.carousel.next(lengthScroll);
//       } else {
//         lengthScroll = carouselComponent.slide.counter - index;
//         carouselComponent.carousel.prev(lengthScroll);
//       }
//     });
//   }

//   scrollableSetup() {
//     if (this.isBrowser) {
//       this.route.fragment.pipe(untilDestroyed(this))
//         .subscribe((value) => {
//           if (!value) {
//             return;
//           }
//           setTimeout(() => {
//             let { top } = document.getElementById(value).getBoundingClientRect();
//             top = top - 150;
//             if (value === 'templates') {
//               top = 50;
//             }
//             window.scrollTo({ top, behavior: 'smooth' });
//             this.setActiveSection(`#${ value }`);
//           }, 0);
//         });

//       ['templates', 'bestPractices', 'guidelines', 'adobeExtension', 'collaborate']
//         .forEach((section) => {
//           const options = {
//             rootMargin: '50px 0px 20px 0px',
//             threshold: [0.25, 1]
//           };

//           const observer = new IntersectionObserver((value) => {
//             this.setActiveSection(`#${ section }`);
//           }, options);

//           observer.observe(document.getElementById(section));
//         });
//     }
//   }

//   setActiveSection(target) {
//     // this.pageService.scrollTo(target);
//     this.activeSection = target;
//   }

//   openPdf(url: string) {
//     const pdfUrl = this.pdfFolder + url;
//     this.clickedCover = {
//       downloadUrl: pdfUrl,
//       fileUrl: pdfUrl
//     };
//     this.pdfViewerService.showPdf(this.clickedCover);
//   }

//   filterTemplates(category) {
//     /*if (category === 'all') {
//       this.filteredTemplates = this.templatesPdfs;
//       this.isoTope.arrange({
//         filter: `*`
//       });
//       this.activeFilter = category;
//       return;
//     }
//     this.filteredTemplates = this.templatesPdfs.filter((item) => {
//       return item.category === category;
//     });

//     this.isoTope.arrange({
//       filter: `.${ category }`
//     });
//     this.activeFilter = category;*/
//   }

//   generateDesktopCarouselItems() {
//     let i, j, tempArray;
//     const chunk = 8;
//     this.carouselItems = [];
//     for (i = 0, j = this.templatesPdfs.length; i < j; i += chunk) {
//       tempArray = this.templatesPdfs.slice(i, i + chunk);
//       if (tempArray.length < chunk) {
//         tempArray.push({});
//       }
//       this.carouselItems.push(tempArray);
//     }
//   }

//   initCarousel() {
//     if (this.isMobile) {
//       this.carouselComponentMobile.initCarousel();
//     } else {
//       this.carouselComponentDesktop.initCarousel();
//     }
//   }

//   videoPopup() {
//     const dialogRef = this.dialog.open(VideoPopupComponent, {
//       width: '100%',
//       height: '85%',
//       data: {
//         videoUrl: `${ this.assetsUrl }/how-to/videos/Collaborate.mp4`,
//         type: 'video'
//       },
//       panelClass: 'video-dialog',
//     });

//     dialogRef
//       .afterClosed()
//       .pipe(untilDestroyed(this))
//       .subscribe((result) => {
//         console.log('The dialog was closed');
//       });
//   }

//   @HostListener('window:resize', ['$event'])
//   windowResize($event) {
//     this.checkForMobile();
//     setTimeout(() => {
//       this.initCarousel();
//     }, 0);
//   }
// }
