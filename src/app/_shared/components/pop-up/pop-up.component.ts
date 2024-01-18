import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Issue } from '_models/issue.model';
import { PageService } from '_shared/services';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-pop-up',
  templateUrl: './pop-up.component.html',
  styleUrls: ['./pop-up.component.scss']
})
export class PopUpComponent implements OnInit {
  assetsUrl = environment.assetsUrl;
  _showPopup = false;
  popupClass = '';
  @Input() popupSizeClass = 'modal900';

  @Output()
  showPopupChange = new EventEmitter();

  constructor(private pageService: PageService) { }

  @Output()
  popupEvent = new EventEmitter<any>();

  @Input()
  set showPopup(val: boolean) {
    this._showPopup = val;
    if (this._showPopup) {
      this.popupClass = 'modal-show';
      this.pageService.addBodyClass('modal-open');
    } else {
      this.popupClass = '';
      this.pageService.removeBodyClass('modal-open');
    }
  }

  ngOnInit() {
  }

  closePopup(issue: Issue = null) {
    this._showPopup = false;
    this.showPopupChange.emit(false);
    this.popupClass = '';
    this.pageService.removeBodyClass('modal-open');
    this.popupEvent.emit({ type: 'popup.closed', issue: issue });
  }

}
