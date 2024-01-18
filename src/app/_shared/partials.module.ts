import { NgModule } from '@angular/core';
import { PageFooterComponent } from './partials/page-footer/page-footer.component';
import { PageHeaderComponent } from './partials/page-header/page-header.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    MatToolbarModule
  ],
  declarations: [
    PageFooterComponent,
    PageHeaderComponent
  ],
  exports: [
    PageFooterComponent,
    PageHeaderComponent
  ],
  providers: [],
})
export class PartialsModule {
}
