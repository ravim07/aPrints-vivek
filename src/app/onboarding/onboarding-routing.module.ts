import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  OnboardingMainComponent,
  OnboardingRegisterComponent,
  OnboardingSearchPublicationComponent,
} from './components';
import { OnboardingGuard } from './onboarding-guard.service';
import {
  OnboardingIssueResolverService,
  OnboardingPageAdPricingResolverService,
  OnboardingPublicationResolverService,
  OnboardingResolverService,
} from './resolvers';

const onboardingRoutes: Routes = [
  {
    path: '',
    component: OnboardingMainComponent,
    data: {
      seo: {
        title: 'aPrintis - Onboarding',
      },
    },
  },
  {
    path: 'search-publication',
    component: OnboardingSearchPublicationComponent,
    data: {
      seo: {
        title: 'aPrintis - Search Publication',
      },
    },
  },
  {
    path: 'register',
    component: OnboardingRegisterComponent,
    data: {
      seo: {
        title: 'aPrintis - Register',
      },
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(onboardingRoutes)],
  exports: [RouterModule],
  providers: [
    OnboardingGuard,
    OnboardingResolverService,
    OnboardingIssueResolverService,
    OnboardingPublicationResolverService,
    OnboardingPageAdPricingResolverService,
  ],
})
export class OnboardingRoutingModule {}
