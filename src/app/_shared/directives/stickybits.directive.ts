import { Directive, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import stickybits from 'stickybits';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appStickybits]'
})
export class StickybitsDirective {
  constructor(elementRef: ElementRef, @Inject(PLATFORM_ID) private platformId: Object) {
    // console.log(stickybits);
    try {
      if (isPlatformBrowser(this.platformId)) {
        const x = stickybits(elementRef.nativeElement, {
          useStickyClasses: true
        });
        // console.log('ok', x);
      }
    } catch (e) {
      // console.log('error!', e);
    }
  }
}
