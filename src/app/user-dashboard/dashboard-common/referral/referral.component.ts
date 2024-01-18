import { Component, OnInit } from '@angular/core';
import { Publication } from '_models/publication.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FormUtilService, AlertService } from '_shared/services';
import { ActivatedRoute, Router } from '@angular/router';
import { InvitationService } from '_services';
import { Invitation } from '_models';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-referral',
  templateUrl: './referral.component.html',
  styleUrls: ['./referral.component.scss']
})
export class ReferralComponent implements OnInit {
  publication: Publication;
  issueId: string;
  newReferralForm: FormGroup;
  formStatusClass;
  previousRoute: string;
  referrals: Invitation[];
  loading = true;
  assetsUrl = environment.assetsUrl;

  constructor(
    public formUtil: FormUtilService,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private invitationService: InvitationService,
  ) { }

  ngOnInit() {
    this.createForm();
    this.invitationService.listReferrals('filter[limit]=100').subscribe(
      referrals => {
        // console.log(referrals);
        this.referrals = referrals.results;
        this.loading = false;
      },
      errorData => {
        console.log('Error: ', errorData);
      }
    );
  }

  createForm() {
    this.newReferralForm = new FormGroup({
      'name': new FormControl(null, [Validators.required]),  
      'email': new FormControl(null, [Validators.required, Validators.email]),      
    });
  }

  addReferral() {
    this.formStatusClass = 'form-inprogress-submit';
    if (this.newReferralForm.valid) {
      const name = this.newReferralForm.get('name').value.split(' ');
      const data = {
        name: name[0],
        lastName: name[1],
        email: this.newReferralForm.get('email').value,
      };

      this.invitationService.newReferral(data).subscribe(
        referral => {
          this.alertService.showAlertSuccess('Referral sent successfully!');
          // console.log(referral);
          this.referrals.push(referral);
          this.newReferralForm.reset();
          this.formStatusClass = '';
        },
        errorData => {
          this.alertService.showAlertDangerApiError(errorData);
        }
      );
    } else {
      this.formUtil.validateAllFormFields(this.newReferralForm);
      this.formStatusClass = '';
    }
  }
}
