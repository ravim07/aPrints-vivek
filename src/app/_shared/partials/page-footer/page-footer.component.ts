import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-page-footer',
  templateUrl: './page-footer.component.html',
  styleUrls: ['./page-footer.component.scss']
})
export class PageFooterComponent implements OnInit {
  assetsUrl = environment.assetsUrl;
  @Input() footerclass: string;

  constructor() { }

  ngOnInit() {
  }

}
