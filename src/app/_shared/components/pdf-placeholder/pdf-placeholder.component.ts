import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pdf-placeholder',
  templateUrl: './pdf-placeholder.component.html',
})
export class PdfPlaceholderComponent {
  @Input() width = 144;
  @Input() height = 206;
}
