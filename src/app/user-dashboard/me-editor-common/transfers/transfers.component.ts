// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { Publication } from '_models/publication.model';
// import { ActivatedRoute, Router } from '@angular/router';
// import { PublicationUrlService } from 'user-dashboard/shared/services';
// import { untilDestroyed } from 'ngx-take-until-destroy';

// @Component({
//   selector: 'app-transfers',
//   templateUrl: './transfers.component.html',
//   styleUrls: ['./transfers.component.scss']
// })
// export class TransfersComponent implements OnInit, OnDestroy {

//   publication: Publication;
//   issueId: string;
//   loading = true;
//   tab = 'none';

//   constructor(
//     private route: ActivatedRoute,
//     private router: Router,
//     private publicationUrlService: PublicationUrlService
//   ) { }

//   ngOnInit() {
//     this.route.data
//     .pipe(untilDestroyed(this)).subscribe(data => {
//       this.publication = data.publication;
//       this.loading = false;
//       this.route.queryParams
//         .subscribe(params => {
//           if (params['tab']) {
//             this.tab = params['tab'];
//           }
//         });
//     });
//     this.issueId = this.route.snapshot.queryParams['issueId'];
//   }

//   goBack() {
//     this.router.navigateByUrl(this.publicationUrlService.getLinkViewIssue(this.publication, this.issueId, this.tab));
//   }

//   ngOnDestroy() {}

// }
