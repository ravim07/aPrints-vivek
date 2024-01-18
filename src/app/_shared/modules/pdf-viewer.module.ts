import { NgModule } from '@angular/core';
import { NewPdfViewerComponent, PdfViewerComponent } from '_shared/components';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    PdfViewerComponent,
    NewPdfViewerComponent,
  ],
  exports: [
    PdfViewerComponent,
    NewPdfViewerComponent,
  ],
  entryComponents: [
    NewPdfViewerComponent
  ]
})
export class PdfViewerModule {
}
