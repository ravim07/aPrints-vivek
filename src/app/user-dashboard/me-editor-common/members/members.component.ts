import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { TableBaseComponent } from 'user-dashboard/shared/components';
import { MembersResolverService, PendingInvitationsResolverService, PublicationResolverService, } from 'user-dashboard/shared/resolvers';
import { ActionsService } from 'user-dashboard/shared/services';
import { Invitation, Member, permissionEnum, role, User } from '_models';
import { Publication } from '_models/publication.model';
import { PermissionsService } from '_services';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: [
    '../../shared/components/table-base/table-base.component.scss',
    './members.component.scss',
  ],
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'd-flex flex-column flex-fill',
  },
})
export class MembersComponent extends TableBaseComponent
  implements OnInit, OnDestroy {
  publication: Publication;
  members: Array<Member>;
  invitations: Array<Invitation>;
  dataSourceData: Array<Invitation | Member> = [];
  dataSource: MatTableDataSource<Member | Invitation>;
  displayedColumns: string[] = [
    'avatar',
    'name',
    'roleLiteral',
    'email',
    'status',
    'menu',
  ];
  roleModel = role;

  canManageContributors: boolean;
  canDeleteMembers: boolean;
  currentUser: User;

  constructor(
    private route: ActivatedRoute,
    private actionsService: ActionsService,
    private publicationResolverService: PublicationResolverService,
    private membersResolverService: MembersResolverService,
    private invitationsResolverService: PendingInvitationsResolverService,
    private permissionsService: PermissionsService
  ) {
    super();
  }

  ngOnInit(): void {
    this.permissionsService.init();
    this.route.data.pipe(untilDestroyed(this)).subscribe((data) => {
      this.loadData(data);
    });
  }

  reload() {
    this.loading = true;
    this.publicationResolverService
      .resolve2(this.publication.id)
      .pipe(untilDestroyed(this))
      .subscribe((pub) => {
        this.membersResolverService
          .resolve2(this.publication)
          .pipe(untilDestroyed(this))
          .subscribe((members) => {
            this.invitationsResolverService
              .resolve2(this.publication.id)
              .pipe(untilDestroyed(this))
              .subscribe((invitations) => {
                this.loadData({
                  publication: pub,
                  members: members,
                  pendingInvitations: invitations,
                });
                console.log('Members reloaded!');
              });
          });
      });
  }

  loadData(data) {
    this.publication = data.publication;
    this.members = data.members;
    this.invitations = data.pendingInvitations;
    this.currentUser = this.permissionsService.currentUser;
    this.dataSourceData = [];
    this.dataSourceData.push(...this.members);
    this.canManageContributors = this.permissionsService.getPermission(
      permissionEnum.manageContributors,
      this.publication
    );
    this.canDeleteMembers = this.permissionsService.getPermission(
      permissionEnum.deleteMembers,
      this.publication
    );
    if (this.invitations && this.canManageContributors) {
      this.dataSourceData.push(...this.invitations);
    }
    // console.log(this.dataSourceData, this.members, this.invitations);
    this.initTable();
  }

  initTable() {
    if (!this.canDeleteMembers) {
      this.displayedColumns.splice(this.displayedColumns.length - 2, 2);
    }
    this.dataSource = new MatTableDataSource(this.dataSourceData);
    this.loading = false;
  }

  newMember(): void {
    this.actionsService.newMember(this.publication, {
      cb: () => this.reload(),
    });
  }

  handleDelete(row: any) {
    if (row.status === 'pending') {
      this.deleteInvitation(row.id);
      return;
    }
    this.deleteMember(row.id, row.role);
  }

  deleteInvitation(invitationId: string): void {
    this.actionsService.deleteInvitation(this.publication, invitationId, () =>
      this.reload()
    );
  }

  deleteMember(memberId: string, roleStr: string): void {
    this.actionsService.deleteMember(this.publication, memberId, roleStr, () =>
      this.reload()
    );
  }

  onPublicationHeaderEvent(event) {
    console.log(event, 'Menu event!');
    if (event === 'reload') {
      this.reload();
    }
  }

  ngOnDestroy() {
  }
}
