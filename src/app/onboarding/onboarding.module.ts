import { NgModule } from '@angular/core';
import { PartialsModule } from '_shared/partials.module';
import { SharedModule } from '_shared/shared.module';
import {
  OnboardingMainComponent,
  OnboardingRegisterComponent,
  OnboardingSearchPublicationComponent,
} from './components';
import { OnboardingRoutingModule } from './onboarding-routing.module';
import { OnboardingHeaderComponent } from './partials';

@NgModule({
  imports: [OnboardingRoutingModule, SharedModule, PartialsModule],
  declarations: [
    OnboardingRegisterComponent, // OK
    OnboardingSearchPublicationComponent, // OK
    OnboardingMainComponent, // OK
    OnboardingHeaderComponent, // OK
  ],
})
export class OnboardingModule {
  // constructor(router: Router) {
  //   console.log('Routes: ', JSON.stringify(router.config, undefined, 2));
  // }
}
