import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-members-cell',
  templateUrl: './members-cell.component.html',
  styleUrls: ['./members-cell.component.scss'],
})
export class MembersCellComponent {
  @Input() pubId: string;
  @Input() set members(val: Array<string>) {
    this._members = val;
  }
  _members: Array<string>;
  constructor(private router: Router) {}
  goToMembers($event) {
    $event.preventDefault();
    $event.stopPropagation();
    if (this._members) {
      this.router.navigate([`/dashboard/publication/${this.pubId}/members`]);
    }
  }
}
