import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { UserDashboardModule } from 'user-dashboard/user-dashboard.module';
import { PublicationListItem } from '_models';
import { StoreService } from '../state';

@Injectable({ providedIn: UserDashboardModule })
export class PublicationsListResolverService
  implements Resolve<PublicationListItem[]> {
  constructor(private storeService: StoreService) {}

  resolve(): Observable<PublicationListItem[]> {
    return this.storeService.refreshPublicationList();
  }

  // resolve(): Observable<PublicationListItem[]> {
  //   return this.publicationService.getPublications().pipe(
  //     map((o) => {
  //       return o.map((item) => {
  //         return new PublicationListItem().deserialize({
  //           publication: item,
  //           id: item.id,
  //           cover: item.cover,
  //           name: item.name,
  //           description: item.description,
  //           show: this.checkPermission(item),
  //           numIssues: item.publicationIssues.length,
  //           members: item.members,
  //           totalFunds:
  //             (item.availableFunds && item.availableFunds.totalAvailable) || 0,
  //         });
  //       });
  //     }),
  //     tap((list) => {
  //       this.storeService.resolverUpdatePublicationList(list);
  //     }),
  //     catchError(() => {
  //       return of(null);
  //     })
  //   );
  // }

  // private checkPermission(pub: Publication): PublicationListItemPerms {
  //   const ret = {
  //     showEditPub: role.hasPermission(pub.role, permission.editPublication),
  //     showCreateIssue: role.hasPermission(pub.role, permission.createIssue),
  //     // subscriber: pub.role === 'subscriber',
  //     issueMenu: [
  //       'managingEditor',
  //       'editorialStaff',
  //       'contributor',
  //       'advertiser',
  //     ].includes(pub.role),
  //   };
  //   return ret;
  // }
}
