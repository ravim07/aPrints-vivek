import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appCarouselItem]'
})
export class CustomCarouselItemDirective {

  constructor( public tpl: TemplateRef<any> ) {
  }

}
