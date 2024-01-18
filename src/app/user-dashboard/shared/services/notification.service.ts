import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'auth/auth.service';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { of, ReplaySubject, zip } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserDashboardModule } from 'user-dashboard/user-dashboard.module';
import { AccessRequest, role } from '_models';
import { RequestAccessService } from '_services';
import { BaseActionsService } from '_services/base-actions.service';
import { AlertService } from '_shared/services';
import { ConfirmComponent } from '../../../_shared/components/confirm/confirm.component';

@Injectable({providedIn: UserDashboardModule})
export class NotificationService
  extends BaseActionsService
  implements OnDestroy {
  private accessRequests = new ReplaySubject<Array<AccessRequest>>();

  constructor(
    private authService: AuthService,
    private requestAccessService: RequestAccessService,
    private alertService: AlertService,
    private requestService: RequestAccessService,
    dialog: MatDialog
  ) {
    super(dialog);
  }

  init() {
    this.authService.isAuthenticated().subscribe((auth) => {
      if (auth && !this.authService.isRole(role.contributor)) {
        this.loadAccessRequests();
      } else {
        this.accessRequests.next([]);
      }
    });
  }

  public removeNotification(notifId: string) {
    const notifs = this.getNotifsLastValue();
    let count = 0,
      index = null;

    notifs.every((req) => {
      if (req.id === notifId) {
        index = count;
        return false;
      }
      ++count;
      return true;
    });

    if (index != null) {
      notifs.splice(index, 1);
      this.accessRequests.next(notifs);
    }
  }

  public update() {
    this.init();
  }

  public getNotifications() {
    return this.accessRequests.asObservable();
  }

  reviewRequest(request: AccessRequest, callback: Function) {
    const dialogConfig = this.setDialogConfig(
      [
        'flat-dialog',
        'confirmation',
        'space-around',
        'height-330',
        'width-700',
      ],
      {
        msg: `${request.userName} requested access to join as ${request.role} to ${request.publicationName}`,
        title: 'Access Request',
        okBtnTxt: 'Approve',
        cancelBtnTxt: 'Deny',
        diffCancelCloseValue: true,
      }
    );
    this.dialog
      .open(ConfirmComponent, dialogConfig)
      .afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe((result) => {
        if (result === true) {
          this.acceptRequest(request.id);
        } else if (result === 'cancel') {
          this.denyRequest(request.id);
        }
      });
  }

  acceptRequest(id: string) {
    this.requestAccessService.approveRequest(id).subscribe(
      () => {
        this.loadAccessRequests();
        this.alertService.showAlertSuccess(
          'Access request accepted succesfuly!'
        );
      },
      (errorData: any) => {
        console.error('Error', errorData);
      }
    );
  }

  denyRequest(id: string) {
    this.requestAccessService.denyRequest(id).subscribe(
      () => {
        this.loadAccessRequests();
        this.alertService.showAlertSuccess('Access request denied succesfuly!');
      },
      (errorData: any) => {
        console.error('Error', errorData);
      }
    );
  }

  reviewRequestDirectLink(params) {
    if (params['accept-request']) {
      this.acceptRequest(params['accept-request']);
    }
    if (params['deny-request']) {
      this.denyRequest(params['deny-request']);
    }
  }

  ngOnDestroy(): void {
  }

  private getNotifsLastValue() {
    let lastValue = null;
    this.accessRequests.forEach((value) => {
      lastValue = value;
    });
    return lastValue;
  }

  private loadAccessRequests() {
    const contributorRequests$ = this.authService.isRole(role.editorialStaff) ? this.requestAccessService.getPendingRequests() : of([]);
    const allRequests$ = this.authService.isRole(role.managingEditor) ? this.requestAccessService.getAllPendingRequests() : of([]);
    return zip(contributorRequests$, allRequests$)
      .pipe(
        map(([contributorRequests, allRequests]) => {
          const result: AccessRequest[] = [];
          if (this.authService.isRole(role.managingEditor)) {
            console.log('Manager - Notifications', allRequests);
            result.push(...allRequests);
          }
          if (this.authService.isRole(role.editorialStaff)) {
            console.log('Editor - Notifications', contributorRequests);
            result.push(...contributorRequests);
          }
          // console.log('result before returning', result);
          return result;
        })
      )
      .subscribe(
        (requests: AccessRequest[]) => {
          // console.log('subscription result', requests);
          this.accessRequests.next(requests);
        },
        (errorData: any) => {
          console.error('Error', errorData);
        }
      );
  }
}
