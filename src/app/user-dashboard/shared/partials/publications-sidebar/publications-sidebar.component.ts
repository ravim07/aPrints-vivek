import { Component, ViewEncapsulation } from '@angular/core';
import { BaseSidebarComponent } from '../base-sidebar/base-sidebar.component';

@Component({
  selector: 'app-publications-sidebar',
  templateUrl: './publications-sidebar.component.html',
  styleUrls: ['../base-sidebar/base-sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PublicationsSidebarComponent extends BaseSidebarComponent {}
