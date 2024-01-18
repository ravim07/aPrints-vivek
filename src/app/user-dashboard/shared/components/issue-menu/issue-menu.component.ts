import { Component, EventEmitter, Input, Output, ViewEncapsulation, } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IssueActionsService } from 'user-dashboard/shared/services';
import { permissionEnum } from '_models';
import { Issue } from '_models/issue.model';
import { Publication } from '_models/publication.model';
import { PermissionsService } from '_services';

@Component({
  selector: 'app-issue-menu',
  templateUrl: './issue-menu.component.html',
  styleUrls: ['./issue-menu.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class IssueMenuComponent {
  @Input() issue: Issue;
  @Output() triggerReload = new EventEmitter<string>();
  canEditIssue: boolean;
  hasPublicationFlowPerms: boolean;
  canViewContributions: boolean;
  canViewAdvertisements: boolean;

  constructor(
    private issueActionsService: IssueActionsService,
    private router: Router,
    private route: ActivatedRoute,
    private permissionsService: PermissionsService
  ) {
  }

  _publication: Publication;

  @Input() set publication(pub: Publication) {
    this.canEditIssue = this.permissionsService.getPermission(
      permissionEnum.editIssue,
      pub
    );
    this.hasPublicationFlowPerms = this.permissionsService.getPermission(
      permissionEnum.publishingFlow,
      pub
    );
    this.canViewContributions = this.permissionsService.getPermission(
      permissionEnum.viewContributions,
      pub
    );
    this.canViewAdvertisements = this.permissionsService.getPermission(
      permissionEnum.viewAdvertisements,
      pub
    );
    this._publication = pub;
  }

  issueDetails(): void {
    console.log(this.issue, this._publication);
    this.router.navigate([
      `/dashboard/publication/${this._publication.id}/issues/${this.issue.id}`,
    ]);
  }

  goToSubmissions(): void {
    this.router.navigate([
      `/dashboard/publication/${this._publication.id}/issues/${this.issue.id}/submissions`,
    ]);
  }

  goToAdvertisements(): void {
    this.router.navigate(['issues', this.issue.id, 'ads'], {relativeTo: this.route});
  }

  goToPrintSpecs() {
    this.router.navigate([
      `/dashboard/publication/${this._publication.id}/issues/${this.issue.id}/print-specs`,
    ]);
  }

  deleteIssue(): void {
    this.issueActionsService.deleteIssue(this.issue);
  }
}
