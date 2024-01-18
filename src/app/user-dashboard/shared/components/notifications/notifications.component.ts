import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { environment } from 'environments/environment';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { interval, Observable } from 'rxjs';
import { NotificationService } from 'user-dashboard/shared/services';
import { AccessRequest } from '_models';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NotificationsComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line: no-inferrable-types
  requests: Array<AccessRequest> = [];
  assetsUrl = environment.assetsUrl;
  interval: Observable<number>;
  notifString: any = 0;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.notificationService.init();
    this.notificationService
      .getNotifications()
      .pipe(untilDestroyed(this))
      .subscribe((notifs) => {
        // console.log('notifications', notifs);
        this.requests = notifs;
        this.notifString = notifs.length;
      });
    if (!this.interval) {
      this.interval = interval(3000 * 60); // Check 3 mins
      this.interval
        .pipe(untilDestroyed(this))
        .subscribe(() => this.notificationService.update());
    }
  }

  action(request) {
    console.log(request);
    this.notificationService.reviewRequest(request, (result) => {
      console.log(result);
      this.notificationService.update();
    });
  }

  ngOnDestroy() {}
}
