import { Component, Input } from '@angular/core';
import { CSS_COLOR_NAMES } from './css-color.model';

@Component({
  selector: 'app-profile-img',
  templateUrl: './profile-img.component.html',
  styleUrls: ['./profile-img.component.scss'],
})
export class ProfileImgComponent {
  @Input() set name(val: string) {
    if (val) {
      this._name = val;
      this.getAvatarColor();
    }
  }
  bgColor: string;
  _name: string;
  @Input() color = 'white';
  @Input() size: number;
  @Input() fontSize: number;
  @Input() isAdmin = false;

  constructor() {}

  getAvatarColor() {
    let color: string;
    const name = this.getCleanName(this._name);
    const maxI = name.length - 1;
    let i = maxI;
    color = CSS_COLOR_NAMES.get(name[i]);
    while (
      !CSS_COLOR_NAMES.get(name[i]) &&
      this.isEmptyOrSpaces(name[i]) &&
      i < maxI
    ) {
      if (!CSS_COLOR_NAMES.get(name[i]) && this.isEmptyOrSpaces(name[i])) {
        i--;
      }
      color = CSS_COLOR_NAMES.get(name[i]);
    }
    this.bgColor = color;
    // console.log(color, this.bgColor, name, i);
  }

  isEmptyOrSpaces(str: string): boolean {
    return str === null || str.match(/^ *$/) !== null;
  }

  getCleanName(str: string): string {
    return str.toLocaleLowerCase().trim();
  }
}
