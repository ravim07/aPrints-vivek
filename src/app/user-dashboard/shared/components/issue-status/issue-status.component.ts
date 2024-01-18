import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { issueStatus } from '_models';

@Component({
  selector: 'app-issue-status',
  templateUrl: './issue-status.component.html',
  styleUrls: ['./issue-status.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueStatusComponent implements OnInit, OnChanges {
  @Input() status: string;
  statusStr: string;
  iconStr: string;

  constructor() {}

  ngOnInit() {
    this.init();
  }

  ngOnChanges(): void {
    this.init();
  }

  init() {
    this.statusStr = issueStatus.showStatus(this.status);
    this.iconStr = issueStatus.getStatusIcon(this.status);
  }
}
