import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-funds-summary',
  templateUrl: './funds-summary.component.html',
  styleUrls: ['./funds-summary.component.scss']
})
export class FundsSummaryComponent implements OnInit {
  @Input() totalAvailable: any;
  @Input() availableFunds: any;

  constructor() {
  }

  ngOnInit() {
  }

}
