import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { PageScrollService } from 'ngx-page-scroll-core';
import { SharedModule } from '_shared/shared.module';

@Injectable({providedIn: SharedModule})
export class PageService {
  private renderer: Renderer2;

  constructor(
    private pageScrollService: PageScrollService,
    @Inject(DOCUMENT) private document: any,
    rendererFactory: RendererFactory2
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  scrollTo(target: string, duration = 200, scrollOffset?) {
    this.pageScrollService.scroll({
      document: this.document,
      scrollTarget: target,
      duration: duration,
      advancedInlineOffsetCalculation: true,
      scrollOffset: scrollOffset,
    });
  }

  addBodyClass(className: string) {
    this.renderer.addClass(this.document.body, className);
  }

  removeBodyClass(className: string) {
    this.renderer.removeClass(this.document.body, className);
  }

  toggleClassToParent(element: any, classname: string) {
    const parent = this.renderer.parentNode(element);
    if (parent) {
      if (parent.classList.contains(classname)) {
        this.renderer.removeClass(parent, classname);
      } else {
        this.renderer.addClass(parent, classname);
      }
    }
  }
}
