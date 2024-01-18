import { Component, OnDestroy, OnInit } from '@angular/core';
import { environment } from 'environments/environment';
import { NotificationService } from 'user-dashboard/shared/services';
import { AccessRequest, role } from '_models';
import { RequestAccessService } from '_services';
import { AlertService } from '_shared/services';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss'],
})
export class RequestsComponent implements OnInit, OnDestroy {
  assetsUrl = environment.assetsUrl;
  loading = true;
  requests: Array<AccessRequest> = [];
  role;

  constructor(
    private requestAccessService: RequestAccessService,
    private notificationService: NotificationService,
    private alertService: AlertService
  ) {
    this.role = role;
  }

  ngOnInit() {
    // this.notificationService.getNotifications()
    // .pipe(untilDestroyed(this)).subscribe(reqs => {
    //     this.requests = reqs;
    //     this.loading = false;
    //   });
  }

  approveRequest(requestId: string) {
    this.requestAccessService.approveRequest(requestId).subscribe(
      () => {
        this.notificationService.removeNotification(requestId);
        this.alertService.showAlertSuccess('Access Request Approved.');
      },
      (errorData) => {
        this.alertService.showAlertDangerApiError(errorData);
      }
    );
  }

  denyRequest(requestId: string) {
    this.requestAccessService.denyRequest(requestId).subscribe(
      () => {
        this.notificationService.removeNotification(requestId);
        this.alertService.showAlertSuccess('Access Request Denied.');
      },
      (errorData) => {
        this.alertService.showAlertDangerApiError(errorData);
      }
    );
  }

  ngOnDestroy() {}
}
