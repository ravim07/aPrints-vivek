import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { UserDashboardModule } from 'user-dashboard/user-dashboard.module';
import { DraftActionsMethodInput, DraftFeedback } from '_models';
import { Issue } from '_models/issue.model';
import { TriggerOrCallbackOptions } from '_models/trigger.interface';
import { DraftService, IssueService } from '_services';
import { BaseActionsService } from '_services/base-actions.service';
import { AlertService } from '_shared/services';
import { SubmitToPrintComponent, SubmitToReviewComponent } from 'user-dashboard/shared/components';
import { ShareIssuePreviewComponent } from 'user-dashboard/shared/modals/share-issue-preview/share-issue-preview.component';

@Injectable({ providedIn: UserDashboardModule })
export class IssueActionsService extends BaseActionsService {
  constructor(
    private draftService: DraftService,
    private issueService: IssueService,
    private alertService: AlertService,
    dialog: MatDialog
  ) {
    super(dialog);
  }

  editIssue(issue, options: TriggerOrCallbackOptions): void {
    this.issueService.updateIssue(issue.id, issue).subscribe(() => {
      this.triggerOrCallback(options);
      this.alertService.showAlertSuccess('Issue saved.');
    });
  }

  uploadNewDraft(input: DraftActionsMethodInput) {
    input.options.trigger.emitter.emit('openUploadDialog');
  }

  submitForReview(input: DraftActionsMethodInput) {
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
      { issue: input.issue }
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
              this.draftService
                .submitForReview(input.draftId, draftFeedback)
                .subscribe(() => {
                  this.triggerOrCallback(input.options);
                  this.alertService.showAlertSuccess(
                    'PDF submitted for review.'
                  );
                });
            });
        }
      });
  }

  cancelReview(input: DraftActionsMethodInput) {
    console.log('cancelReview', input.draftId);
    this.confirmAction(
      {
        msg: `The PDF is under review right now.
        Are you sure you want to cancel this review? `,
        okBtnTxt: 'Confirm',
        cancelBtnTxt: 'Cancel',
      },
      {
        obs: this.draftService.cancelReview(input.draftId, false),
        cb: () => {
          this.triggerOrCallback(input.options);
          input.options.trigger.emitter.emit('closeUploadDialog');
          if (input.upload) {
            input.options.trigger.emitter.emit('openUploadDialog');
          } else {
            this.alertService.showAlertSuccess('Review Canceled.');
          }
        },
      }
    );
  }

  reuploadDraft(input: DraftActionsMethodInput) {
    console.log('reuploadDraft', input.draftId);
    this.confirmAction(
      {
        msg: `Are you sure you want to replace the current draft? `,
        okBtnTxt: 'Confirm',
        cancelBtnTxt: 'Cancel',
      },
      {
        cb: () => {
          this.uploadNewDraft(input);
        },
      }
    );
  }

  submitToPrint(input: DraftActionsMethodInput) {
    console.log('submitForReview', input.draftId);
    const dialogConfig = this.setDialogConfig(
      [
        'flat-dialog',
        'submit-to-review',
        'space-around',
        // 'height-800',
        'width-1100',
      ],
      {
        issue: input.issue,
        publication: input.publication,
      }
    );
    this.dialog
      .open(SubmitToPrintComponent, dialogConfig)
      .afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe((result) => {
        if (result) {
          this.issueService
            .updateIssue(input.issue.id, input.issue)
            .subscribe(() => {
              this.draftService.submitForPrint(input.issue, result)
                .subscribe(() => {
                  this.triggerOrCallback(input.options);
                  this.alertService.showAlertSuccess(
                    'PDF submitted for print schedule.'
                  );
                });
            });
        }
      });
  }

  deleteIssue(issue: Issue) {
    console.log(issue);
  }

  openPreviewIssue(input) {
    const dialogConfig = this.setDialogConfig(
      [
        'flat-dialog',
        'normal',
        'space-around',
        'height-500',
        'width-700',
      ],
      {
        issue: input.issue,
        publication: input.publication,
      }
    );
    this.dialog.open(ShareIssuePreviewComponent, dialogConfig).afterClosed().subscribe();
  }
}
