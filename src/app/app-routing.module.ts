import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { role } from '_models';
import { CalculatorComponent } from '_shared/components';
import {
  CheckInvitationResolverService,
  CurrentUserResolverService,
  DonationLevelResolverService,
  PublicationPreviewResolverService,
  PublicationsResolverService,
  SubscriptionTypeResolverService,
} from '_shared/resolvers';
import { IssuePreviewResolverService } from '_shared/resolvers/issue-preview-resolver.service';
import { AuthLogoutGuardService } from 'auth/auth-logout-guard.service';
import { AuthGuard } from 'auth/auth.guard';
import { NoAuthGuardService } from 'auth/no-auth-guard.service';
import { HowToPageComponent } from 'components/how-to-page/how-to-page.component';
import { PublicationIssuePreviewComponent } from 'components/publication-issue-preview/publication-issue-preview.component';
import {
  AboutComponent,
  AdvertiseComponent,
  ContactComponent,
  DonateComponent,
  FaqComponent,
  FeaturesComponent,
  HowToGetStartedComponent,
  JoinPublicationComponent,
  LandingComponent,
  PrintNowComponent,
  PrivacyPolicyComponent,
  PublicationComponent,
  QuoteComponent,
  ReferralsComponent,
  RegisterPubComponent,
  RequestSampleComponent,
  SubscribeComponent,
  TestimonialsComponent,
} from './components';
import { OnboardingPageAdPricingResolverService } from './onboarding/resolvers';
import { SelectivePreloadingStrategy } from './selective-preloading-strategy';

// import { SeoService } from '_services/seo.service';
// import { filter, map } from 'rxjs/operators';
import { WhyComponent } from './components/why/why.component';

const routes: Routes = [
  {
    path: 'home',
    component: LandingComponent,
    data: {
      seo: {
        title: 'aPrintis Homepage',
        description: `Stunning print quality that every school or community can afford`,
        screenshot: 'featuredImage3.png',
      },
    },
  },
  {
    path: 'faq',
    component: FaqComponent,
    data: {
      seo: {
        title: 'aPrintis Frequently Asked Questions',
        description: 'Frequently Asked Questions',
        screenshot: 'featuredImage3.png',
      },
    },
  },
  {
    path: 'about',
    component: AboutComponent,
    data: {
      seo: {
        title: 'About aPrintis',
        description: `Our team consists of dedicated professionals with decades of experience in print, graphics design and media`,
        screenshot: 'featuredImage3.png',
      },
    },
  },
  {
    path: 'why',
    component: WhyComponent,
    data: {
      seo: {
        title: 'Why aPrintis?',
        description: `Our team consists of dedicated professionals with decades of experience in print, graphics design and media`,
        screenshot: 'featuredImage3.png',
      },
    },
  },
  {
    path: 'features',
    component: FeaturesComponent,
    data: {
      seo: {
        title: 'aPrintis Features',
        description: 'Features',
        screenshot: 'featuredImage3.png',
      },
    },
  },
  {
    path: 'contact',
    component: ContactComponent,
    data: {
      seo: {
        title: 'Contact aPrintis',
        description: `We're here to help and answer any question you might have. We look forward to hering from you.`,
        screenshot: 'featuredImage3.png',
      },
    },
  },
  {
    path: 'request-sample',
    component: RequestSampleComponent,
    data: {
      seo: {
        title: 'aPrintis - Request Sample',
        description: 'Request Sample',
        screenshot: 'featuredImage3.png',
      },
    },
  },
  // {
  //   path: 'design',
  //   component: DesignComponent,
  //   data: {
  //     seo: {
  //       title: 'aPrintis Design Resources',
  //       description:
  //         'A number of tools and guidelines for you to print your publication',
  //       screenshot: 'featuredImage3.png',
  //     },
  //   },
  // },
  {
    path: 'how-to-get-started',
    component: HowToGetStartedComponent,
    data: {
      seo: {
        title: 'aPrintis - How to Get Started',
        description: `Whether you are a graphics designer, an editor, a content contributor or seek to sponsor
        the publication - you will create a publication that truly represents your community`,
        screenshot: 'featuredImage3.png',
      },
    },
  },
  {
    path: 'how-to',
    component: HowToPageComponent,
    data: {
      seo: {
        title: 'aPrintis - How to Get Started',
        description: `Learn how to get more benefits`,
        screenshot: 'featuredImage3.png',
      },
    },
  },
  {
    path: 'print-now',
    component: PrintNowComponent,
    data: {
      seo: {
        title: 'Print Now - Magazines, Newsletters',
        description: 'Print Now',
        screenshot: 'featuredImage3.png',
      },
    },
  },
  {
    path: 'quote',
    component: QuoteComponent,
    data: {
      seo: {
        title: 'Quote Request',
        description: `Please provide us with information about your publication and expect a quote within hours`,
        screenshot: 'featuredImage3.png',
      },
    },
  },
  {
    path: 'calculator',
    component: CalculatorComponent,
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent,
    data: {
      seo: {
        title: 'aPrintis Privacy Policy',
        description:
          'The aPrintis Privacy Statement explains what personal data aPrintis collects and how the company uses it.',
        screenshot: 'featuredImage3.png',
      },
    },
  },
  {
    path: 'testimonials',
    component: TestimonialsComponent,
    data: {
      seo: {
        title: 'aPrintis - Testimonials',
        description: 'Testimonials',
        screenshot: 'featuredImage3.png',
      },
    },
  },
  {
    path: 'join-publication',
    component: JoinPublicationComponent,
    resolve: {
      invitation: CheckInvitationResolverService,
      currentUser: CurrentUserResolverService,
    },
  },
  {
    path: 'publication/:publicationId',
    component: PublicationComponent,
    resolve: {
      currentUser: CurrentUserResolverService,
      publication: PublicationPreviewResolverService,
      publications: PublicationsResolverService,
    },
  },
  {
    path: 'p/:publicationId/i/:issueId',
    component: PublicationIssuePreviewComponent,
    resolve: {
      // currentUser: CurrentUserResolverService,
      publication: PublicationPreviewResolverService,
      issue: IssuePreviewResolverService,
      // publications: PublicationsResolverService,
    },
  },
  {
    path: 'p/:publicationId',
    component: PublicationComponent,
    resolve: {
      currentUser: CurrentUserResolverService,
      publication: PublicationPreviewResolverService,
      publications: PublicationsResolverService,
    },
  },
  {
    path: 'publication/:publicationId/donate/:levelId',
    component: DonateComponent,
    resolve: {
      publication: PublicationPreviewResolverService,
      level: DonationLevelResolverService,
    },
  },
  {
    path: 'publication/:publicationId/subscribe/:subscriptionTypeId',
    component: SubscribeComponent,
    resolve: {
      publication: PublicationPreviewResolverService,
      subscriptionType: SubscriptionTypeResolverService,
    },
  },
  {
    path: 'publication/:publicationId/advertise/:pageAdPricingId/register',
    component: RegisterPubComponent,
    data: { role: role.advertiser },
    resolve: {
      publication: PublicationPreviewResolverService,
      adPricing: OnboardingPageAdPricingResolverService,
    },
  },
  {
    path: 'publication/:publicationId/advertise/:pageAdPricingId/pay',
    component: AdvertiseComponent,
    resolve: {
      publication: PublicationPreviewResolverService,
      adPricing: OnboardingPageAdPricingResolverService,
    },
  },
  {
    path: 'referral',
    component: ReferralsComponent,
    data: {
      seo: {
        title: 'aPrintis - Referrals',
        description: `Refer aPrintis to a Publisher`,
        screenshot: 'featuredImage3.png',
      },
    },
  },
  {
    path: 'referral/register',
    component: RegisterPubComponent,
    data: { role: 'referrer' },
  },
  {
    path: 'onboarding',
    loadChildren: () =>
      import('./onboarding/onboarding.module').then((m) => m.OnboardingModule),
    data: {
      seo: {
        title: 'aPrintis - Onboarding',
      },
    },
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin.module').then((m) => m.AdminModule),
    canLoad: [AuthGuard],
    data: {
      seo: {
        title: 'aPrintis - Admin Dashboard',
      },
    },
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./user-dashboard/user-dashboard.module').then(
        (m) => m.UserDashboardModule
      ),
    canLoad: [AuthGuard],
    data: {
      seo: {
        title: 'aPrintis - Dashboard',
      },
    },
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      onSameUrlNavigation: 'reload',
      // enableTracing: true, // <-- debugging purposes only
      preloadingStrategy: SelectivePreloadingStrategy,
    }),
  ],
  exports: [RouterModule],
  providers: [
    SelectivePreloadingStrategy,
    AuthGuard,
    NoAuthGuardService,
    AuthLogoutGuardService,
    CheckInvitationResolverService,
    CurrentUserResolverService,
    PublicationPreviewResolverService,
    IssuePreviewResolverService,
    PublicationsResolverService,
    DonationLevelResolverService,
    SubscriptionTypeResolverService,
    OnboardingPageAdPricingResolverService,
  ],
})
export class AppRoutingModule {
  constructor() {}
}
