import { LayoutModule } from '@angular/cdk/layout';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import {
  BrowserModule,
  BrowserTransferStateModule,
} from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { MdePopoverModule } from '@material-extended/mde';
import { NgxJsonLdModule } from '@ngx-lite/json-ld';
import {
  CarouselItemElementDirective,
  CustomCarouselComponent,
  CustomCarouselItemDirective,
  LoginPopupComponent,
  NewPdfViewerComponent,
} from '_shared/components';
import { SafeStylePipe, StickybitsDirective } from '_shared/directives';
import {
  BrowserStateInterceptor,
  HttpTokenInterceptor,
} from '_shared/interceptors';
import { SearchPopupComponent } from '_shared/partials';
import { PartialsModule } from '_shared/partials.module';
import { TruncateTextPipe } from '_shared/pipes/truncate-text.pipe';
import { SharedModule } from '_shared/shared.module';
import { IvyCarouselModule } from 'angular-responsive-carousel';
import {
  AutologinComponent,
  ForgotPasswordComponent,
  LoginComponent,
  RegisterComponent,
  ResetPasswordComponent,
} from 'auth';
import { AuthRoutingModule } from 'auth/auth-routing.module';
import { ReviewDialogComponent } from 'components/landing/review-dialog.component';
import { VideoPopupComponent } from 'components/landing/video-popup/video-popup.component';
import { IntercomModule } from 'ng-intercom';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { NgMasonryGridModule } from 'ng-masonry-grid';
import { NgxPageScrollModule } from 'ngx-page-scroll';
import { NgxPageScrollCoreModule } from 'ngx-page-scroll-core';
import { NgxStripeModule } from 'ngx-stripe';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BlogModule } from './blog/blog.module';
import {
  AboutComponent,
  AdvertiseComponent,
  CalculatorOldComponent,
  ContactComponent,
  // DesignComponent,
  DonateComponent,
  FaqComponent,
  FeaturesComponent,
  HeroComponent,
  HeroMobileComponent,
  HeroV2Component,
  HowToGetStartedComponent,
  JoinPublicationComponent,
  LandingComponent,
  LandingHeaderComponent,
  LoadingComponent,
  PrintNowComponent,
  PrivacyPolicyComponent,
  PublicationComponent,
  QuoteComponent,
  ReferralsComponent,
  RegisterPubComponent,
  RequestSampleComponent,
  SubscribeComponent,
  TestimonialsComponent,
  WhyComponent,
} from './components';
import { HowToPageComponent } from './components/how-to-page/how-to-page.component';
import { PublicationIssuePreviewComponent } from './components/publication-issue-preview/publication-issue-preview.component';
import { SelectAdvertisementTypeComponent } from './components/select-advertisement-type/select-advertisement-type.component';
import { SelectSponsorshipLevelComponent } from './components/select-sponsorship-level/select-sponsorship-level.component';
import { SelectSubscriptionTypeComponent } from './components/select-subscription-type/select-subscription-type.component';
import { MaterialModule } from './material.module';

@NgModule({
  declarations: [
    AppComponent,
    SearchPopupComponent,
    LandingComponent,
    FaqComponent,
    JoinPublicationComponent,
    PublicationComponent,
    AboutComponent,
    FeaturesComponent,
    HowToGetStartedComponent,
    PrintNowComponent,
    PrivacyPolicyComponent,
    LoginComponent,
    RegisterComponent,
    AutologinComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    ContactComponent,
    RequestSampleComponent,
    ReferralsComponent,
    // DesignComponent,
    QuoteComponent,
    TestimonialsComponent,
    HeroComponent,
    HeroV2Component,
    HeroMobileComponent,
    LandingHeaderComponent,
    DonateComponent,
    RegisterPubComponent,
    SubscribeComponent,
    AdvertiseComponent,
    TruncateTextPipe,
    ReviewDialogComponent,
    VideoPopupComponent,
    CustomCarouselComponent,
    CustomCarouselItemDirective,
    CarouselItemElementDirective,
    StickybitsDirective,
    SafeStylePipe,
    CalculatorOldComponent,
    LoadingComponent,
    SelectSubscriptionTypeComponent,
    SelectSponsorshipLevelComponent,
    SelectAdvertisementTypeComponent,
    HowToPageComponent,
    PublicationIssuePreviewComponent,
    WhyComponent,
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'aprintis-frontend' }),
    LazyLoadImageModule,
    HttpClientModule,
    AuthRoutingModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    LayoutModule,
    MaterialModule,
    MdePopoverModule,
    NgxPageScrollCoreModule.forRoot({ duration: 200 }),
    NgxJsonLdModule,
    NgMasonryGridModule,
    PartialsModule,
    SharedModule,
    NgxStripeModule.forRoot(environment.stripePublicKey),
    IntercomModule.forRoot({
      appId: environment.intercomId, // from your Intercom config
      updateOnRouterChange: true, // will automatically run `update` on router event changes. Default: `false`
    }),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
    }),
    BrowserTransferStateModule,
    IvyCarouselModule,
    BlogModule,
    NgxPageScrollModule,
    // BrowserAnimationsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: HttpTokenInterceptor, multi: true },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: BrowserStateInterceptor,
      multi: true,
    },
    // { provide: ErrorHandler, useClass: SentryErrorHandler },
    // { provide: RouteReuseStrategy, useClass: RouteReuseService },
    // { provide: 'Window', useValue: window }
  ],
  entryComponents: [
    ReviewDialogComponent,
    VideoPopupComponent,
    LoginPopupComponent,
    LoadingComponent,
    SelectSubscriptionTypeComponent,
    SelectSponsorshipLevelComponent,
    SelectAdvertisementTypeComponent,
    NewPdfViewerComponent,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  // Diagnostic only: inspect router configuration
  // constructor(router: Router) {
  //   console.log('Routes: ', JSON.stringify(router.config, undefined, 2));
  // }
}
