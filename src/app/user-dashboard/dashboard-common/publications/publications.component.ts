import {
  AfterContentChecked,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { TableBaseComponent } from 'user-dashboard/shared/components';
import {
  AccessRequestsResolverService,
  PublicationsListResolverService,
} from 'user-dashboard/shared/resolvers';
import { NotificationService } from 'user-dashboard/shared/services';
import { ActionsService } from 'user-dashboard/shared/services/actions.service';
import { StoreService } from 'user-dashboard/shared/state';
import { PublicationListItem } from '_models';
import { Publication } from '_models/publication.model';
import { PermissionsService } from '_services';

@Component({
  selector: 'app-publications',
  templateUrl: './publications.component.html',
  styleUrls: [
    '../../shared/components/table-base/table-base.component.scss',
    './publications.component.scss',
  ],
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'd-flex flex-column flex-fill',
  },
})
export class PublicationsComponent
  extends TableBaseComponent
  implements OnInit, OnDestroy, AfterContentChecked {
  publicationsList: Array<PublicationListItem> = [];
  dataSource: MatTableDataSource<PublicationListItem>;
  displayedColumns: string[] = [
    'cover',
    'name',
    'description',
    'numIssues',
    'members',
    'menu',
  ];

  canCreatePublication: boolean;
  canSeeOwnPendingRequests = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private actionsService: ActionsService,
    private publicationResolverService: PublicationsListResolverService,
    private accessRequestsResolverService: AccessRequestsResolverService,
    private permissionsService: PermissionsService,
    private notificationsService: NotificationService,
    private changeDetector: ChangeDetectorRef,
    private storeService: StoreService
  ) {
    super();
    permissionsService.init();
  }

  ngOnInit(): void {
    this.storeService.currentAccessRequestList
      .pipe(untilDestroyed(this))
      .subscribe(async (requests) => {
        this.storeService.currentPublicationList
          .pipe(untilDestroyed(this))
          .subscribe((list: PublicationListItem[]) => {
            this.initTable({
              publications: list,
              requests: requests,
            });
          });
      });
    this.reload();
    this.route.queryParams.pipe(untilDestroyed(this)).subscribe((params) => {
      this.notificationsService.reviewRequestDirectLink(params);
    });
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  initTable({ publications, requests }) {
    this.canSeeOwnPendingRequests = !this.permissionsService.currentUser.roles.includes(
      'managingEditor'
    );
    this.publicationsList = publications.concat(requests);
    // console.log(this.publicationsList);
    this.canCreatePublication = this.permissionsService.currentUser.roles.includes(
      'managingEditor'
    );
    if (
      this.canSeeOwnPendingRequests &&
      this.displayedColumns.indexOf('status') === -1
    ) {
      this.displayedColumns.splice(
        this.displayedColumns.length - 1,
        0,
        'status'
      );
    } else if (
      !this.canSeeOwnPendingRequests &&
      this.displayedColumns.indexOf('totalFunds') === -1
    ) {
      this.displayedColumns.splice(
        this.displayedColumns.length - 2,
        0,
        'totalFunds'
      );
    }
    this.dataSource = new MatTableDataSource(this.publicationsList);
    this.loading = false;
  }

  reload(pub?: Publication) {
    if (pub) {
      this.router.navigate([`/dashboard/publication/${pub.id}`], {
        queryParams: { newIssue: true },
      });
    } else {
      this.loading = true;
      this.storeService
        .refreshPublicationList()
        .pipe(untilDestroyed(this))
        .subscribe((list: PublicationListItem[]) => {
          this.storeService
            .refreshAccessRequestList()
            .pipe(untilDestroyed(this))
            .subscribe((requests: PublicationListItem[]) => {
              this.initTable({
                publications: list,
                requests: requests,
              });
              console.log('Publications reloaded!');
            });
        });
    }
  }

  newPublication(): void {
    this.actionsService.newPublication((pub: Publication) => {
      this.reload(pub);
    });
  }

  searchPublication(): void {
    this.router.navigate(['/dashboard/search-publication/contributor']);
  }

  onPublicationMenuEvent(event) {
    console.log(event, 'Menu event!');
    if (event === 'reload') {
      this.reload();
    }
  }

  rowClick(row: Publication) {
    this.router.navigate([`/dashboard/publication/${row.id}`]);
  }

  ngOnDestroy() {}
}
