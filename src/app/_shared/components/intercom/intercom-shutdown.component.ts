import { Component, OnInit } from '@angular/core';
import { Intercom } from 'ng-intercom';

@Component({
  selector: 'app-intercom-shutdown',
  templateUrl: './intercom.component.html',
  styleUrls: ['./intercom.component.scss']
})
export class IntercomShutdownComponent implements OnInit {

  constructor(public intercom: Intercom) { }

  ngOnInit() {
    this.intercom.shutdown();
  }

}
