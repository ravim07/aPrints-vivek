import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-config-button',
  templateUrl: './config-button.component.html',
  styleUrls: ['./config-button.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ConfigButtonComponent {
  @Input() pubId: string;
  @Input() issueId: string;
  @Input() canEditIssue: boolean;
  @Input() canEditPub: boolean;

  constructor() {}
}
