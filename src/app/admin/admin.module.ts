import { NgModule } from '@angular/core';

import { IssueService, DraftService, MemberService } from '_services';
import { PageService, AlertService } from '_shared/services';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';
import { AdminComponent } from './admin.component';
import { AdminHeaderComponent } from './shared/partials/admin-header.component';
import { ViewIssueComponent } from './view-issue/view-issue.component';
import { SharedModule } from '_shared/shared.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { MailingAddressFormComponent } from './mailing-address-form/mailing-address-form.component';
import { PrintingSpecsFormComponent } from './printing-specs-form/printing-specs-form.component';
import { ShippingAddressesComponent } from './shipping-addresses/shipping-addresses.component';
import { MatDialogModule } from '@angular/material';

@NgModule({
  imports: [
    AdminRoutingModule,
    SharedModule,
    CKEditorModule,
    MatDialogModule
  ],
  declarations: [
    AdminComponent,
    AdminDashboardComponent,
    AdminHeaderComponent,
    ViewIssueComponent,
    MailingAddressFormComponent,
    PrintingSpecsFormComponent,
    ShippingAddressesComponent
  ],
  providers: [
    IssueService,
    DraftService,
    PageService,
    AlertService,
    MemberService,
  ]
})
export class AdminModule { }
