import { Directive, ElementRef, PLATFORM_ID, Inject } from '@angular/core';
import { environment } from 'environments/environment';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appShowPassword]',
})
export class ShowPasswordDirective {

  private _shown = false;

  constructor(private el: ElementRef, @Inject(PLATFORM_ID) private platformId: Object) {
    this.setup();
  }

  setup() {
    if (isPlatformBrowser(this.platformId)) {
      // Client only code.
      const parent = this.el.nativeElement.parentNode;
      const span = document.createElement('span');
      span.style.cssText = 'position: absolute; top: 12px; right: 15px;';
      span.innerHTML = `<img src=${environment.assetsUrl}/icons/password.svg style="width: 17px;opacity: 0.19;">`;
      span.addEventListener('click', (event) => {
        this.toggle(span);
      });
      parent.appendChild(span);
    }
  }

  toggle(span: HTMLElement) {
    this._shown = !this._shown;
    if (this._shown) {
      this.el.nativeElement.setAttribute('type', 'text');
    } else {
      this.el.nativeElement.setAttribute('type', 'password');
    }
  }
}
