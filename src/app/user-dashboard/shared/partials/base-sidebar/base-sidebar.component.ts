import { Component, Input, OnDestroy, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-base-sidebar',
  templateUrl: './base-sidebar.component.html',
  styleUrls: ['./base-sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BaseSidebarComponent implements OnDestroy {
  @Input() selected: string;

  constructor() {}

  ngOnDestroy() {}
}
