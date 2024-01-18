import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { issueStatus, STATUS_PROGRESS_SECUENCE } from '_models';

@Component({
  selector: 'app-issue-status-progress',
  templateUrl: './issue-status-progress.component.html',
  styleUrls: ['./issue-status-progress.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueStatusProgressComponent implements OnInit, OnChanges {
  @Input() status: string;
  statusStr: string;
  step: number;

  constructor() {}

  ngOnInit() {
    this.init();
  }

  ngOnChanges(): void {
    this.init();
  }

  init() {
    this.statusStr = issueStatus.showStatus(this.status);
    this.step = STATUS_PROGRESS_SECUENCE.get(this.status);
  }
}
