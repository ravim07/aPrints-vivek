import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { ActionsService } from 'user-dashboard/shared/services';
import { permissionEnum } from '_models';
import { Publication } from '_models/publication.model';
import { PermissionsService } from '_services';

@Component({
  selector: 'app-publication-menu',
  templateUrl: './publication-menu.component.html',
  styleUrls: ['./publication-menu.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PublicationMenuComponent {
  @Input() set publication(pub: Publication) {
    this.canEditPublication = this.permissionsService.getPermission(
      permissionEnum.editPublication,
      pub
    );
    this._publication = pub;
  }
  @Output() triggerReload = new EventEmitter<string>();

  canEditPublication: boolean;
  _publication: Publication;

  constructor(
    private actionsService: ActionsService,
    private router: Router,
    private permissionsService: PermissionsService
  ) {}

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
}
