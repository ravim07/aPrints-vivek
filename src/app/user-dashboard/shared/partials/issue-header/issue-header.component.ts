import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { DraftBaseComponent } from 'user-dashboard/shared/components';
import { IssueActionsService } from 'user-dashboard/shared/services';
import { PermissionsService } from '_services';

@Component({
  selector: 'app-issue-header',
  templateUrl: './issue-header.component.html',
  styleUrls: ['./issue-header.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueHeaderComponent extends DraftBaseComponent {
  issueNameEdit = false;

  constructor(
    issueActionsService: IssueActionsService,
    permissionsService: PermissionsService
  ) {
    super(issueActionsService, permissionsService);
  }

  editIssue() {
    this.issueNameEdit = true;
    console.log('editIssue');
  }

  cancelEditIssue() {
    this.issueNameEdit = false;
  }

  reuploadDraft() {
    this.issueActionsService.reuploadDraft({
      draftId: this.draft.id,
      publication: this.publication,
      issue: this.issue,
      options: this.defaultTriggerAndCb,
      upload: true,
    });
  }

  saveIssue() {
    this.issueNameEdit = false;
    if (this.issueName !== this.editIssueForm.get('name').value) {
      this.issueActionsService.editIssue(
        { id: this.issue.id, name: this.editIssueForm.get('name').value },
        this.defaultTriggerAndCb
      );
    }
  }
}
