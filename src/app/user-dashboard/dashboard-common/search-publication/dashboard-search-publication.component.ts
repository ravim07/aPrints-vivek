import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OnboardingService } from '_services/onboarding.service';
import { role } from '_models';
import { Publication } from '_models/publication.model';
import { SearchService } from '_services';

@Component({
  selector: 'app-dashboard-search-publication',
  templateUrl: './dashboard-search-publication.component.html',
  styleUrls: ['./dashboard-search-publication.component.scss'],
  providers: [SearchService],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardSearchPublicationComponent implements OnInit {
  url = 'dashboard';
  role: string;
  roleStr: string;
  connector = 'a';

  constructor(
    private route: ActivatedRoute,
    private onboardingService: OnboardingService
  ) {}

  ngOnInit() {
    this.role = this.route.snapshot.paramMap.get('role');
    this.onboardingService.updateRole(this.role);
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
