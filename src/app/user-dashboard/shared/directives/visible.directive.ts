import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appVisible]',
})
export class VisibleDirective {
  @Input() set isVisible(condition: boolean) {
    this.el.nativeElement.style.visibility = condition ? 'visible' : 'hidden';
  }
  constructor(private el: ElementRef) {}
}
