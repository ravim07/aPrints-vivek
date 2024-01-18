import { Component, OnInit } from '@angular/core';
import { Intercom } from 'ng-intercom';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-intercom',
  templateUrl: './intercom.component.html',
  styleUrls: ['./intercom.component.scss']
})
export class IntercomComponent implements OnInit {

  constructor(public intercom: Intercom) { }

  ngOnInit() {
    this.intercom.boot({
      app_id: environment.intercomId,
      // Supports all optional configuration.
      // widget: {
      //   'activator': '#intercom'
      // }
    });
  }

}
