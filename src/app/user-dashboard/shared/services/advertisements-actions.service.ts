import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserDashboardModule } from 'user-dashboard/user-dashboard.module';
import { Contribution } from '_models/contribution.model';
import { Issue } from '_models/issue.model';
import { Publication } from '_models/publication.model';
import { TriggerOrCallbackOptions } from '_models/trigger.interface';
import { BaseActionsService } from '_services/base-actions.service';
import { AlertService } from '_shared/services';
import { ContributionService } from './contribution.service';
import { AdService } from 'user-dashboard/shared/services/ad.service';
import { AdvertisementService } from 'user-dashboard/shared/services/advertisement.service';
import { AdResource } from '_models/ad-resource.model';

@Injectable({ providedIn: UserDashboardModule })
export class AdvertisementsActionsService extends BaseActionsService {
  constructor(
    dialog: MatDialog,
    private alertService: AlertService,
    private advertisementService: AdvertisementService
  ) {
    super(dialog);
  }
  newArticle(router: Router, pub: Publication, issue: Issue) {
    router.navigate([
      `/dashboard/publication/${pub.id}/issues/${issue.id}/ads/new`,
    ]);
  }
  deleteArticle(advertisement: AdResource, options: TriggerOrCallbackOptions) {
    console.log('deleteArticle', advertisement.id);
    this.confirmAction(
      {
        msg: `You are about to delete '${advertisement.title}' . Are you sure?`,
        okBtnTxt: 'Confirm',
        cancelBtnTxt: 'Cancel',
      },
      {
        obs: this.advertisementService.delete(advertisement.id),
        cb: () => {
          this.triggerOrCallback(options);
          this.alertService.showAlertSuccess(
            `'${advertisement.title}' deleted.`
          );
        },
      }
    );
  }
}
