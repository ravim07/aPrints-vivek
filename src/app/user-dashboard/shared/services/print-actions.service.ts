import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { UserDashboardModule } from 'user-dashboard/user-dashboard.module';
import { DraftActionsMethodInput, DraftFeedback } from '_models';
import { IssueService } from '_services';
import { BaseActionsService } from '_services/base-actions.service';
import { AlertService } from '_shared/services';
import { SubmitToReviewComponent } from '../components/submit-to-review/submit-to-review.component';

@Injectable({ providedIn: UserDashboardModule })
export class PrintActionsService extends BaseActionsService {
  constructor(
    private issueService: IssueService,
    private alertService: AlertService,
    dialog: MatDialog
  ) {
    super(dialog);
  }

  changePrintPrefs(input: DraftActionsMethodInput) {
    console.log('submitForReview', input.draftId);
    const draftFeedback = new DraftFeedback();
    draftFeedback.msg = '';
    const dialogConfig = this.setDialogConfig(
      [
        'flat-dialog',
        'submit-to-review',
        'space-around',
        'height-800',
        'width-700',
      ],
      { issue: input.issue, noWarning: true }
    );
    this.dialog
      .open(SubmitToReviewComponent, dialogConfig)
      .afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe((result) => {
        if (result) {
          input.issue.printingPreferences = result;
          this.issueService
            .updateIssue(input.issue.id, input.issue)
            .subscribe(() => {
              // this.triggerOrCallback(input.options);
              this.alertService.showAlertSuccess('Print prefs updated!.');
            });
        }
      });
  }
}
