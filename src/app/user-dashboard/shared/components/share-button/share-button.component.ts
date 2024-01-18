import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AlertService } from '_shared/services';
import { MdePopoverTrigger } from '@material-extended/mde';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-share-button',
  templateUrl: './share-button.component.html',
  styleUrls: ['./share-button.component.scss']
})
export class ShareButtonComponent implements OnInit {
  @ViewChild(MdePopoverTrigger, {static: false}) trigger: MdePopoverTrigger;
  link: string;
  assetsUrl = environment.assetsUrl;
  _publicationId: string;

  @Input()
  set publicationId(val: string) {
    this.link = environment.frontBaseUrl + '/publication/' + val;
  }

  constructor(
    private route: ActivatedRoute,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    const publicationId = this.route.snapshot.paramMap.get('publicationId');
    this.link = environment.frontBaseUrl + '/publication/' + publicationId;
  }

  copyLink() {
    this.alertService.showAlertSuccess('Link copied to clipboard.');
    this.trigger.togglePopover();
  }

  closePopup() {
    this.trigger.togglePopover();
  }
}
