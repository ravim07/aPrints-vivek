import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { canChangePrintSpecs, permissionEnum } from '_models';
import { Issue } from '_models/issue.model';
import { Publication } from '_models/publication.model';
import { PermissionsService } from '_services';
import { BaseSidebarComponent } from '../base-sidebar/base-sidebar.component';

@Component({
  selector: 'app-issue-sidebar',
  templateUrl: './issue-sidebar.component.html',
  styleUrls: ['../base-sidebar/base-sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class IssueSidebarComponent extends BaseSidebarComponent
  implements OnInit {
  @Input() issue: Issue;
  publicationId: string;
  issueId: string;
  canChangePrintSpecs: boolean;
  canEditIssue: boolean;
  canListAds: boolean;
  canListContributions: boolean;

  constructor(private permissionsService: PermissionsService) {
    super();
  }

  _publication: Publication;

  @Input() set publication(pub: Publication) {
    this._publication = pub;
    this.canListAds = this.permissionsService.getPermission(
      permissionEnum.viewAdvertisements,
      pub
    );
    this.canListContributions = this.permissionsService.getPermission(
      permissionEnum.viewContributions,
      pub
    );
    this.canEditIssue = this.permissionsService.getPermission(
      permissionEnum.editIssue,
      pub
    );
  }

  ngOnInit(): void {
    this.publicationId = this._publication.id;
    this.issueId = this.issue.id;
    this.canChangePrintSpecs = canChangePrintSpecs(this.issue);
  }
}
