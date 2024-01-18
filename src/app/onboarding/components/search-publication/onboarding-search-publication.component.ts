import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { role } from '_models';
import { Publication } from '_models/publication.model';
import { SearchService } from '_services';
import {OnboardingService} from '_services/onboarding.service';

@Component({
  selector: 'app-onboarding-search-publication',
  templateUrl: './onboarding-search-publication.component.html',
  styleUrls: ['./onboarding-search-publication.component.scss'],
  providers: [SearchService],
  encapsulation: ViewEncapsulation.None,
})
export class OnboardingSearchPublicationComponent implements OnInit {
  url = 'onboarding';
  role: string;
  roleStr: string;
  connector = 'a';

  constructor(
    private router: Router,
    private onboardingService: OnboardingService
  ) {}

  ngOnInit() {
    this.role = this.onboardingService.getRole();
    if (!this.role) {
      this.router.navigate(['/onboarding']);
    }
    this.roleStr = role.getStrRole(this.role);
    if (this.role === role.editorialStaff) {
      this.connector = 'an';
    }
  }

  onPublicationSelect(pub: Publication) {
    this.onboardingService.updatePublicationId(pub.id);
  }

  onContinue() {
    this.onboardingService.registerOrContinue();
  }
}
