import { Component, Input, OnChanges, ViewEncapsulation } from '@angular/core';
import { permissionEnum } from '_models';
import { Publication } from '_models/publication.model';
import { PermissionsService } from '_services';
import { BaseSidebarComponent } from '../base-sidebar/base-sidebar.component';

@Component({
  selector: 'app-issues-sidebar',
  templateUrl: './issues-sidebar.component.html',
  styleUrls: ['../base-sidebar/base-sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class IssuesSidebarComponent extends BaseSidebarComponent implements OnChanges {
  canManageInvoices: boolean;
  publicationId: string;
  canManageSubscriptions: boolean;
  canManageSponsorships: boolean;
  canManageTransfers: boolean;
  canManageAdvertising: boolean;
  canEditIssue: boolean;

  constructor(private permissionsService: PermissionsService) {
    super();
  }

  _publication: Publication;

  @Input() set publication(pub: Publication) {
    this._publication = pub;
    this.canManageSubscriptions = this.permissionsService.getPermission(
      permissionEnum.fundraisingReport,
      pub
    );
    this.canManageSponsorships = this.permissionsService.getPermission(
      permissionEnum.fundraisingReport,
      pub
    );
    this.canManageTransfers = this.permissionsService.getPermission(
      permissionEnum.transfers,
      pub
    );
    this.canManageAdvertising = this.permissionsService.getPermission(
      permissionEnum.advertising,
      pub
    );
    this.canEditIssue = this.permissionsService.getPermission(
      permissionEnum.editIssue,
      pub
    );
    this.canManageInvoices = this.permissionsService.getPermission(
      permissionEnum.canManageInvoices,
      pub
    );
  }

  ngOnChanges() {
    // console.log('IssueSidebarOnChanges', this._publication);
    if (this._publication) {
      this.publicationId = this._publication.id;
    }
  }
}
