import { ScrollingModule as ExperimentalScrollingModule } from '@angular/cdk-experimental/scrolling';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  CalculatorComponent,
  ConfirmComponent,
  InputFileControlComponent,
  IntercomComponent,
  IntercomShutdownComponent,
  IssueDiscussionComponent,
  LoginPopupComponent,
  LogoComponent,
  PaymentInfoComponent,
  PdfPlaceholderComponent,
  PopUpComponent,
  ProfileImgComponent,
  PwdConfirmDialogComponent,
  SearchPublicationComponent,
  ShippingAddressFormComponent,
  UploadFileComponent,
  UserMenuComponent,
} from '_shared/components';
import { FundsSummaryComponent } from '_shared/components/funds-summary/funds-summary.component';
import { ProfileEditComponent } from '_shared/modals/profile-edit/profile-edit.component';
import { SafeHtmlPipe } from '_shared/pipes/safe-html.pipe';
import { MaterialModule } from 'app/material.module';
import { ImpersonateComponent } from 'auth';
import {
  MultipleDatePickerComponent,
  PriceCalculatorComponent,
} from 'user-dashboard/shared/components';
import { AdPlaceholderComponent } from './components/ad-placeholder/ad-placeholder.component';
import { IssueNewComponent } from './components/issue-new/issue-new.component';
import { PublicationNewComponent } from './components/publication-new/publication-new.component';
import { ShowPasswordDirective } from './directives';
import { PdfViewerModule } from './modules/pdf-viewer.module';
import { AmountPipe } from './pipes/amount.pipe';
import { FirstLetterPipe } from './pipes/first-letter.pipe';
import { TimeAgoPipe } from './pipes/time-ago.pipe';
import { TimeZonePipe } from './pipes/time-zone.pipe';
import { TzTagPipe } from './pipes/tz-tag.pipe';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
    PdfViewerModule,
    ScrollingModule,
    ExperimentalScrollingModule,
  ],
  declarations: [
    PopUpComponent,
    TimeAgoPipe,
    TimeZonePipe,
    AmountPipe,
    TzTagPipe,
    SafeHtmlPipe,
    FirstLetterPipe,
    InputFileControlComponent,
    PaymentInfoComponent,
    PriceCalculatorComponent,
    MultipleDatePickerComponent,
    ShowPasswordDirective,
    UploadFileComponent,
    PwdConfirmDialogComponent,
    IntercomComponent,
    IntercomShutdownComponent,
    ImpersonateComponent,
    IssueDiscussionComponent,
    LogoComponent,
    ProfileImgComponent,
    UserMenuComponent,
    CalculatorComponent,
    PublicationNewComponent,
    IssueNewComponent,
    PdfPlaceholderComponent,
    ConfirmComponent,
    SearchPublicationComponent,
    LoginPopupComponent,
    AdPlaceholderComponent,
    ProfileEditComponent,
    FundsSummaryComponent,
    ShippingAddressFormComponent,
  ],
  exports: [
    CommonModule,
    ScrollingModule,
    ExperimentalScrollingModule,
    PopUpComponent,
    SafeHtmlPipe,
    TimeAgoPipe,
    TimeZonePipe,
    AmountPipe,
    TzTagPipe,
    FirstLetterPipe,
    InputFileControlComponent,
    PaymentInfoComponent,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
    PdfViewerModule,
    PriceCalculatorComponent,
    MultipleDatePickerComponent,
    ShowPasswordDirective,
    UploadFileComponent,
    PwdConfirmDialogComponent,
    IntercomComponent,
    IntercomShutdownComponent,
    ImpersonateComponent,
    IssueDiscussionComponent,
    LogoComponent,
    ProfileImgComponent,
    UserMenuComponent,
    CalculatorComponent,
    PublicationNewComponent,
    IssueNewComponent,
    PdfPlaceholderComponent,
    ConfirmComponent,
    SearchPublicationComponent,
    AdPlaceholderComponent,
    FundsSummaryComponent,
    ShippingAddressFormComponent,
  ],
  entryComponents: [
    PaymentInfoComponent,
    PwdConfirmDialogComponent,
    PublicationNewComponent,
    IssueNewComponent,
    ConfirmComponent,
    ProfileEditComponent,
    FundsSummaryComponent,
    ShippingAddressFormComponent,
  ],
})
export class SharedModule {}
