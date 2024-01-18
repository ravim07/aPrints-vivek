import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-add-members-button',
  templateUrl: './add-members-button.component.html',
  styleUrls: ['./add-members-button.component.scss']
})
export class AddMembersButtonComponent {

  @Input() issueId: string;
  @Input() pubId: string;
  @Input() showText = true;

  constructor() { }

}
