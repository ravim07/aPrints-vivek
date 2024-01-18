import { Component, OnInit } from '@angular/core';
import { environment } from 'environments/environment';
import { Router } from '@angular/router';
import { AuthService } from 'auth/auth.service';
import { User } from '_models';

@Component({
  selector: 'app-referrals',
  templateUrl: './referrals.component.html',
  styleUrls: ['./referrals.component.scss']
})
export class ReferralsComponent implements OnInit {
  currentUser: User;
  assetsUrl = environment.assetsUrl;

  constructor(
    protected router: Router,
    protected authService: AuthService) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
  }

  makeReferral() {
    if (this.currentUser) {
      this.router.navigateByUrl('dashboard/referrals');
    } else {
      this.router.navigateByUrl('referral/register');
    }
  }
}
