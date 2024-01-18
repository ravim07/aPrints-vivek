import { Component, Input } from '@angular/core';

import { PageService } from '_shared/services';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-search-popup',
  templateUrl: './search-popup.component.html',
  styleUrls: ['./search-popup.component.scss']
})
export class SearchPopupComponent {
  assetsUrl = environment.assetsUrl;
  _textQuery = '';
  // TODO: borrar
  description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
    'Vivamus sit amet faucibus erat. Fusce maximus, felis vitae ultricies ' +
    'consectetur, arcu velit interdum eros, in rutrum velit leo nec metus. ' +
    'Proin vulputate justo a malesuada aliquam. Quisque risus tellus, tempor at tincidunt eget, suscipit consectetur dui.';
  // TODO: borrar
  index = [1, 2];

  constructor(private pageService: PageService) { }

  @Input()
  set textQuery(value: string) {
    if (value) {
      this.pageService.addBodyClass('modal-open');
    }
  }

  set showPopup(val: boolean) {
    /*this._showPopup = val;
    if (this._showPopup) {
      this.showAddCommentSection = false;
      this.popupClass = 'modal-show';
      this.pageService.addBodyClass('modal-open');
    } else {
      this.popupClass = '';
      this.pageService.removeBodyClass('modal-open');
    }*/
  }

  closePopup(issue = null) {
    /*this._showPopup = false;
    this.popupClass = '';
    this.pageService.addBodyClass('modal-open');
    this.popupEvent.emit({ 'type': 'popup.closed', 'issue': issue });*/
  }

}
