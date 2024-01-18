// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { Publication } from '_models/publication.model';
// import { ActivatedRoute, Router } from '@angular/router';
// import { AdvertisingService } from '_services';
// import { PublicationUrlService } from 'user-dashboard/shared/services';
// import { Issue } from '_models/issue.model';
// import { AdResource } from '_models/ad-resource.model';
// import { environment } from 'environments/environment';
// import { untilDestroyed } from 'ngx-take-until-destroy';

// @Component({
//   selector: 'app-advertising-resources',
//   templateUrl: './advertising-resources.component.html',
//   styleUrls: ['./advertising-resources.component.scss']
// })
// export class AdvertisingResourcesComponent implements OnInit, OnDestroy {

//   assetsUrl = environment.assetsUrl;

//   publication: Publication;
//   issue: Issue;
//   loading = true;

//   showAdResourcePopUp = false;
//   currentAdResource: AdResource;

//   constructor(
//     private route: ActivatedRoute,
//     private advertisingService: AdvertisingService,
//     private router: Router,
//     private publicationUrlService: PublicationUrlService
//   ) { }

//   ngOnInit() {
//     this.route.data
//     .pipe(untilDestroyed(this)).subscribe(data => {
//         this.publication = data.publication;
//         this.issue = data.issue;
//         // console.log(this.publication, this.issue);
//         this.loading = false;
//       });
//   }

//   viewAdResource(adResource: AdResource) {
//     this.currentAdResource = adResource;
//     this.showAdResourcePopUp = true;
//   }

//   goBack() {
//     this.router.navigateByUrl(this.publicationUrlService.getLinkViewIssue(this.publication, this.issue.id, 'advertising'));
//   }

//   ngOnDestroy() {}

// }
