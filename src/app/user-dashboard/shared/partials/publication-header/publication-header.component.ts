import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { ActionsService } from 'user-dashboard/shared/services';
import { permissionEnum } from '_models';
import { Publication } from '_models/publication.model';
import { PermissionsService } from '_services';

@Component({
  selector: 'app-publication-header',
  templateUrl: './publication-header.component.html',
  styleUrls: ['./publication-header.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicationHeaderComponent implements OnInit {
  @Input() set publication(pub: Publication) {
    this._publication = pub;
    this.init();
    this.canEditPublication = this.permissionsService.getPermission(
      permissionEnum.editPublication,
      pub
    );
    this.canAddMembers = this.permissionsService.getPermission(
      permissionEnum.addMembers,
      pub
    );
    this.canSeeFunds = this.permissionsService.getPermission(
      permissionEnum.fundraisingReport,
      pub
    );
  }
  @Input() context = 'publications';
  @Output() triggerReload = new EventEmitter<string>();

  _publication: Publication;

  backLink: string;
  publicationName: string;
  totalAvailable: number;

  canEditPublication: boolean;
  canAddMembers: boolean;
  canSeeFunds: boolean;

  constructor(
    private actionsService: ActionsService,
    private router: Router,
    private permissionsService: PermissionsService
  ) {}

  ngOnInit() {
    this.init();
  }

  init() {
    if (this._publication) {
      this.publicationName = this._publication.name;
      this.totalAvailable = this._publication.availableFunds
        ? this._publication.availableFunds.totalAvailable || 0
        : 0;
      switch (this.context) {
        case 'publications':
          this.backLink = '/dashboard';
          break;
        case 'issues':
          this.backLink = `/dashboard/publication/${this._publication.id}`;
          break;
      }
    }
  }

  sharePublicationLink(): void {
    this.actionsService.sharePublicationLink(
      this._publication,
      this.triggerReload
    );
  }

  editPublication(): void {
    this.actionsService.editPublication(this._publication, this.triggerReload);
  }

  viewIssues(): void {
    this.router.navigate([`/dashboard/publication/${this._publication.id}`]);
  }

  addMember(): void {
    this.actionsService.newMember(this._publication, {
      trigger: { emitter: this.triggerReload, event: 'reload' },
    });
  }

  subscribeToPublication() {
    console.log('subscribeAction');
  }

  sponsorPublication() {
    console.log('sponsor');
  }
}
