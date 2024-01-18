import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AlertService } from '_shared/services';
import { StatesService, /*FundraisingService,*/ PaymentService, UserService } from '_services';
import { FormUtilService, PageService } from '_shared/services';
import { PublicationPreview, /*DonationLevel,*/ PageAdPricing } from '_models';

import { environment } from '../../../environments/environment';

import { Element as StripeElement } from 'ngx-stripe';
import { AuthService } from 'auth/auth.service';
import { untilDestroyed } from 'ngx-take-until-destroy';

@Component({
  selector: 'app-advertise',
  templateUrl: './advertise.component.html',
  styleUrls: ['./advertise.component.scss']
})
export class AdvertiseComponent implements OnInit, OnDestroy {
  publication: PublicationPreview;
  adPricing: PageAdPricing;
  payAdForm: FormGroup;
  formStatusClass = '';
  errorApi = '';
  messageSent = false;
  states: Array<string> = [];
  card: StripeElement;
  statusData;
  disableSubmit = false;

  assetsUrl = environment.assetsUrl;

  constructor(
    private route: ActivatedRoute,
    public formUtil: FormUtilService,
    private stateService: StatesService,
    private pageService: PageService,
    // private fundraisingService: FundraisingService,
    private alertService: AlertService,
    private paymentService: PaymentService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.route.data.pipe(untilDestroyed(this)).subscribe(async data => {
      this.publication = data.publication;
      this.adPricing = data.adPricing; // console.log(this.adPricing);
      this.authService.isAuthenticated().subscribe(async auth => {
        if (!auth) {
          this.router.navigateByUrl(`publication/${this.publication.id}/advertise/${this.adPricing.id}/register`);
        }
      });
      this.createForm();
      this.card = await this.paymentService.initCard(this.card);
    });

    this.stateService.getStates().subscribe(states => this.states = states);
  }

  private createForm() {
    this.payAdForm = new FormGroup({
      'firstName': new FormControl(null, [Validators.required]),
      'lastName': new FormControl(null, [Validators.required]),
      'email': new FormControl(null, [Validators.required, Validators.email]),
      'phoneNumber': new FormControl(null),
      'address1': new FormControl('', [Validators.required]),
      'address2': new FormControl(''),
      'city': new FormControl(null, [Validators.required]),
      'state': new FormControl(null, [Validators.required]),
      'zip': new FormControl(null, [Validators.required, Validators.pattern(/^[0-9]{5}(?:-[0-9]{4})?$/)]),
    });
  }

  payAd() {
    if (this.validateForm()) {
      this.disableSubmit = true;
      return this.paymentService.createCardToken({
        card: this.card,
        firstName: this.payAdForm.get('firstName').value,
        lastName: this.payAdForm.get('lastName').value,
        address1: this.payAdForm.get('address1').value,
        address2: this.payAdForm.get('address2').value,
        city: this.payAdForm.get('city').value,
        state: this.payAdForm.get('state').value,
        zip: this.payAdForm.get('zip').value,
      })
      .pipe(untilDestroyed(this)).subscribe(result => {
        this.disableSubmit = false;
        if (result.token) {
          this.chargeAd(result.token.id);
        } else if (result.error) {
          // Error creating the token
          console.log(result.error.message);
          this.errorApi = result.error.message;
        }
      });
    }
  }

  validateForm() {
    this.formStatusClass = 'form-inprogress-submit';
    this.errorApi = '';
    if (!this.payAdForm.valid) {
      this.formUtil.validateAllFormFields(this.payAdForm);
      this.scrollToError();
      this.formStatusClass = '';
    }
    return this.payAdForm.valid;
  }

  chargeAd(token) {
    this.disableSubmit = true;
    this.paymentService.addPaymentForAd(this.publication.id, this.getAdPaymentData(token)).subscribe(
      () => {
        this.disableSubmit = false;
        this.formStatusClass = '';
        this.messageSent = true;
        this.payAdForm.reset();
        this.card.clear();
        this.userService.updateUserRoles(this.authService.getToken()).subscribe(() => {
          if(this.statusData){
            this.router.navigateByUrl(
              `dashboard/publication/${this.statusData.publicationId}/advertising/${this.statusData.issueId}/resources`
            );
          } else {
            this.router.navigateByUrl('dashboard');
          }
        });
      },
      errorData => {
        this.disableSubmit = false;
        this.pageService.scrollTo('.simple-page-form');
        this.errorApi = this.alertService.errorApiToString(errorData);
        this.formStatusClass = '';
      }
    );
  }

  private getAdPaymentData(token) {
    const data = {
      adPricingId: this.adPricing.id,
      amount: this.adPricing.chargeAmount,
      email: this.payAdForm.get('email').value,
      name: this.payAdForm.get('firstName').value,
      lastName: this.payAdForm.get('lastName').value,
      stripeToken: token,
      mailingAddress: {
        addressedTo: this.payAdForm.get('firstName').value + ' ' + this.payAdForm.get('lastName').value,
        address1: this.payAdForm.get('address1').value,
        address2: this.payAdForm.get('address2').value ? this.payAdForm.get('address2').value : '',
        city: this.payAdForm.get('city').value,
        state: this.payAdForm.get('state').value,
        zip: this.payAdForm.get('zip').value,
        phone: this.payAdForm.get('phoneNumber').value ? this.payAdForm.get('phoneNumber').value : '',
        shipTo: ''
      }
    };
    return data;
  }

  private scrollToError() {
    let target = '';

    if (this.payAdForm.get('firstName').invalid || this.payAdForm.get('lastName').invalid) {
      target = '.group-name';
    } else if (this.payAdForm.get('email').invalid) {
      target = '.group-email';
    } else if (this.payAdForm.get('address1').invalid) {
      target = '.group-message';
    } else if (this.payAdForm.get('city').invalid || this.payAdForm.get('state').invalid) {
      target = '.group-state';
    } else {
      target = '.group-zip';
    }
    this.pageService.scrollTo(target);
  }

  ngOnDestroy() {}
}
