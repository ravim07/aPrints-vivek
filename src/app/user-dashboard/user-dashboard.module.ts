import { NgModule } from '@angular/core';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { MdePopoverModule } from '@material-extended/mde';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ClipboardModule } from 'ngx-clipboard';
import { LightboxModule } from 'ngx-lightbox';
import { SharedModule } from '_shared/shared.module';
import { AdResourceFormComponent, PublicationAdsComponent } from './dashboard-advertiser';
import {
  DashboardSearchPublicationComponent,
  IssueDetailsComponent,
  IssuesComponent,
  ProfileEditComponent,
  PublicationsComponent,
  ReferralComponent,
  SubmissionComponent,
  SubmissionsComponent,
} from './dashboard-common';
import { PublicationSubscriptionComponent } from './dashboard-subscriber';
import {
  AddMembersButtonComponent,
  DraftUploadPanelComponent,
  MailingPrefsComponent,
  MembersComponent,
  PrintSpecsComponent,
  RequestsComponent,
} from './me-editor-common';
import { AdvertisingComponent } from './me-editor-common/advertising';
import { SponsorshipsComponent } from './me-editor-common/sponsorship';
import { SubscriptionsComponent } from './me-editor-common/subscriptions';
import {
  AdsBaseComponent,
  ConfigButtonComponent,
  DraftBaseComponent,
  EmptyListPlaceholderComponent,
  ImportCsvFileComponent,
  InputFileCsvComponent,
  InputFileEmailsCsvComponent,
  InviteNewMemberComponent,
  IssueBaseComponent,
  IssueMenuComponent,
  IssueStatusComponent,
  IssueStatusProgressComponent,
  LoadingAnimationTableComponent,
  MemberNewComponent,
  MembersCellComponent,
  NoteComponent,
  NotificationsComponent,
  PriceCalculatorNewComponent,
  PublicationMenuComponent,
  ShareButtonComponent,
  ShareComponent,
  SponsorshipsLevelsComponent,
  SponsorshipsReportComponent,
  SubmitToPrintComponent,
  SubmitToReviewComponent,
  SubscriberImportCsvComponent,
  SubscriberManualNewComponent,
  SubscriptionReportComponent,
  SubscriptionTypesComponent,
} from './shared/components';
import { AdRateSheetComponent } from './shared/components/ad-rate-sheet/ad-rate-sheet.component';
import { AdvertisingReportComponent } from './shared/components/advertising-report/advertising-report.component';
import { ComponentHostDirective, DragDropFileUploadDirective, VisibleDirective, } from './shared/directives';
import {
  BaseSidebarComponent,
  DashHeaderComponent,
  DashSidebarComponent,
  IssueHeaderComponent,
  IssueSidebarComponent,
  IssuesSidebarComponent,
  PublicationHeaderComponent,
  PublicationsSidebarComponent,
} from './shared/partials';
import { UserDashboardRoutingModule } from './user-dashboard-routing.module';
import { UserDashboardComponent } from './user-dashboard.component';
import { AdComponent, AdsComponent } from 'user-dashboard/advertiser';
import { BankAccountDialogComponent } from 'user-dashboard/payments/modals/bank-account-dialog/bank-account-dialog.component';
import { TransferFundsDialogComponent } from 'user-dashboard/payments/modals/transfer-funds-dialog/transfer-funds-dialog.component';
import { TransfersPreviewTableComponent } from 'user-dashboard/payments/components/transfers-preview-table/transfers-preview-table.component';
import { TransfersComponent } from 'user-dashboard/payments/components/transfers/transfers.component';
import { CustomerAccountComponent } from 'user-dashboard/payments/components/customer-account/customer-account.component';
import { VerifyBankAccountComponent } from 'user-dashboard/payments/components/verify-bank-account/verify-bank-account.component';
import { BankAccountInfoComponent } from 'user-dashboard/payments/components/bank-account-info/bank-account-info.component';
import { ChargeAccountComponent } from 'user-dashboard/payments/components/charge-account/charge-account.component';
import { MatStepperModule } from '@angular/material';
import { ForthcomingFeatureComponent } from './shared/components/forthcoming-feature/forthcoming-feature.component';
import { PayoutsComponent } from './payments/components/payouts/payouts.component';
import { InvoiceListComponent } from 'user-dashboard/invoices/components/invoice-list/invoice-list.component';
import { ShippingAddressComponent } from './shipping-address/shipping-address.component';
import { ShippingAddressImportComponent } from './shipping-address/modals/shipping-address-import/shipping-address-import.component';
import { ShareIssuePreviewComponent } from './shared/modals/share-issue-preview/share-issue-preview.component';
import { AddressIssueRelatedComponent } from './shipping-address/modals/address-issue-related/address-issue-related.component';

@NgModule({
  imports: [
    UserDashboardRoutingModule,
    MdePopoverModule,
    ClipboardModule,
    SharedModule,
    LightboxModule,
    Ng2SmartTableModule,
    CKEditorModule,
    MatStepperModule,
  ],
  declarations: [
    UserDashboardComponent,
    ProfileEditComponent,
    PublicationsComponent,
    BaseSidebarComponent,
    DraftBaseComponent,
    IssueBaseComponent,
    AdsBaseComponent,
    PublicationsSidebarComponent,
    PublicationHeaderComponent,
    IssuesSidebarComponent,
    IssueSidebarComponent,
    IssueHeaderComponent,
    MemberNewComponent,
    ShareComponent,
    IssuesComponent,
    IssueDetailsComponent,
    IssueStatusComponent,
    IssueStatusProgressComponent,
    SponsorshipsComponent,
    SubscriptionsComponent,
    SubscriptionTypesComponent,
    InviteNewMemberComponent,
    SubscriberManualNewComponent,
    ImportCsvFileComponent,
    SubscriptionReportComponent,
    SponsorshipsReportComponent,
    SponsorshipsLevelsComponent,
    DraftUploadPanelComponent,
    SubmitToReviewComponent,
    SubmitToPrintComponent,
    PrintSpecsComponent,
    SubmissionsComponent,
    MailingPrefsComponent,
    DashHeaderComponent,
    DashSidebarComponent,
    MembersComponent,
    PublicationAdsComponent,
    AdResourceFormComponent,
    ShareButtonComponent,
    InputFileCsvComponent,
    InputFileEmailsCsvComponent,
    RequestsComponent,
    PublicationSubscriptionComponent,
    // CustomerAccountComponent,
    // BankAccountInfoComponent,
    // VerifyBankAccountComponent,
    // ChargeAccountComponent,
    // TransfersPreviewTableComponent,
    // AdvertisingPreviewTableComponent,
    // AdvertisingPricingMatrixComponent,
    // AdvertisingReportComponent,
    // AdvertisingResourcesComponent,
    // AdvertisingInviteComponent,
    ReferralComponent,
    ConfigButtonComponent,
    NotificationsComponent,
    SubscriberImportCsvComponent,
    NoteComponent,
    PublicationMenuComponent,
    IssueMenuComponent,
    AddMembersButtonComponent,
    DragDropFileUploadDirective,
    ComponentHostDirective,
    VisibleDirective,
    EmptyListPlaceholderComponent,
    LoadingAnimationTableComponent,
    PriceCalculatorNewComponent,
    SubmissionComponent,
    MembersCellComponent,
    DashboardSearchPublicationComponent,
    DraftUploadPanelComponent,
    AdvertisingComponent,
    AdRateSheetComponent,
    AdvertisingReportComponent,
    AdsComponent,
    AdComponent,


    BankAccountDialogComponent,
    TransferFundsDialogComponent,
    TransfersPreviewTableComponent,
    TransfersComponent,
    CustomerAccountComponent,
    VerifyBankAccountComponent,
    BankAccountInfoComponent,
    ChargeAccountComponent,
    ForthcomingFeatureComponent,
    PayoutsComponent,
    InvoiceListComponent,
    ShippingAddressComponent,
    ShippingAddressImportComponent,
    ShareIssuePreviewComponent,
    AddressIssueRelatedComponent,
  ],
  entryComponents: [
    ShareComponent,
    MemberNewComponent,
    SubscriptionTypesComponent,
    InviteNewMemberComponent,
    SubscriberManualNewComponent,
    ImportCsvFileComponent,
    SubscriptionReportComponent,
    SponsorshipsReportComponent,
    SponsorshipsLevelsComponent,
    SubmitToReviewComponent,
    SubmitToPrintComponent,
    AdRateSheetComponent,
    AdvertisingReportComponent,
    BankAccountDialogComponent,
    TransferFundsDialogComponent,
    // ShippingAddressFormComponent,
    ShippingAddressImportComponent,
    ShareIssuePreviewComponent,
    AddressIssueRelatedComponent,
  ],
})
export class UserDashboardModule {
}
