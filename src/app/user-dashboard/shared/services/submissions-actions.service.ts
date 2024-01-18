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

@Injectable({ providedIn: UserDashboardModule })
export class SubmissionsActionsService extends BaseActionsService {
  constructor(
    dialog: MatDialog,
    private alertService: AlertService,
    private contributionService: ContributionService
  ) {
    super(dialog);
  }
  newArticle(router: Router, pub: Publication, issue: Issue) {
    router.navigate([
      `/dashboard/publication/${pub.id}/issues/${issue.id}/submissions/new`,
    ]);
  }
  deleteArticle(contribution: Contribution, options: TriggerOrCallbackOptions) {
    console.log('deleteArticle', contribution.id);
    this.confirmAction(
      {
        msg: `You are about to delete '${contribution.title}' . Are you sure?`,
        okBtnTxt: 'Confirm',
        cancelBtnTxt: 'Cancel',
      },
      {
        obs: this.contributionService.delete(contribution.id),
        cb: () => {
          this.triggerOrCallback(options);
          this.alertService.showAlertSuccess(
            `'${contribution.title}' deleted.`
          );
        },
      }
    );
  }
}
