import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IssueActionsService } from 'user-dashboard/shared/services';
import {
  ACTIONABLE_STATUS,
  ACTIONS_BUTTON_CAPTION,
  ACTIONS_METHODS,
  Draft,
  issueStatus,
  permissionEnum,
} from '_models';
import { Issue } from '_models/issue.model';
import { Publication } from '_models/publication.model';
import { TriggerOrCallbackOptions } from '_models/trigger.interface';
import { PermissionsService } from '_services';

@Component({
  template: '',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DraftBaseComponent implements OnInit, OnChanges, OnDestroy {
  @Input() issue: Issue;
  @Input() draft: Draft;
  @Input() publication: Publication;
  @Output() triggerReload = new EventEmitter<string>();

  defaultTriggerAndCb: TriggerOrCallbackOptions;

  issueName: string;
  issueStatus: string;
  isCancelable = false;
  isFirstUpload = false;
  hasAction = false;
  canUpload = false;
  actionCaption: string;
  editIssueForm: FormGroup;

  canEditIssue: boolean;
  hasPublicationFlowPerms: boolean;

  constructor(
    public issueActionsService: IssueActionsService,
    private permissionsService: PermissionsService
  ) {
    this.defaultTriggerAndCb = {
      cb: () => this.init(),
      trigger: { emitter: this.triggerReload, event: 'reload' },
    };
  }

  init() {
    this.issueName = this.issue.name;
    this.issueStatus = this.issue.lastStatus.statusTo;
    this.isFirstUpload = this.issueStatus === issueStatus.draftUploaded;
    this.isCancelable =
      this.issueStatus === issueStatus.draftInReview ||
      this.issueStatus === issueStatus.draftSubmittedForReview;
    this.canUpload =
      this.issueStatus === issueStatus.issueCreated ||
      this.issueStatus === issueStatus.reviewCanceled ||
      this.issueStatus === issueStatus.draftRejected;
    this.hasAction = ACTIONABLE_STATUS.has(this.issueStatus);
    if (this.hasAction) {
      this.actionCaption = ACTIONS_BUTTON_CAPTION.get(this.issueStatus);
    }
    this.canEditIssue = this.permissionsService.getPermission(
      permissionEnum.editIssue,
      this.publication
    );
    this.hasPublicationFlowPerms = this.permissionsService.getPermission(
      permissionEnum.publishingFlow,
      this.publication
    );
    this.editIssueForm = new FormGroup({
      name: new FormControl(this.issue.name, [Validators.required]),
    });
  }

  action() {
    this.issueActionsService[ACTIONS_METHODS.get(this.issueStatus)]({
      draftId: this.draft ? this.draft.id : '',
      publication: this.publication,
      issue: this.issue,
      options: this.defaultTriggerAndCb,
    });
  }

  ngOnInit() {
    this.init();
  }

  ngOnChanges() {
    this.init();
  }

  ngOnDestroy() {}
}
