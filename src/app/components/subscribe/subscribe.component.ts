import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AlertService } from '_shared/services';
import { StatesService, FundraisingService, PaymentService } from '_services';
import { FormUtilService, PageService } from '_shared/services';
import { PublicationPreview, DonationLevel, SubscriptionType } from '_models';

import { environment } from '../../../environments/environment';

import { Element as StripeElement } from 'ngx-stripe';
import { AuthService } from 'auth/auth.service';
import { untilDestroyed } from 'ngx-take-until-destroy';

@Component({
  selector: 'app-subscribe',
  templateUrl: './subscribe.component.html',
  styleUrls: ['./subscribe.component.scss']
})
export class SubscribeComponent implements OnInit, OnDestroy {
  publication: PublicationPreview;
  subscriptionType: SubscriptionType;
  subscriptionForm: FormGroup;
  formStatusClass = '';
  errorApi = '';
  messageSent = false;
  states: Array<string> = [];
  card: StripeElement;
  disableSubmit = false;

  assetsUrl = environment.assetsUrl;

  constructor(
    private route: ActivatedRoute,
    public formUtil: FormUtilService,
    private stateService: StatesService,
    private pageService: PageService,
    private fundraisingService: FundraisingService,
    private alertService: AlertService,
    private paymentService: PaymentService,
    private authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.route.data.pipe(untilDestroyed(this)).subscribe(async data => {
      this.publication = data.publication;
      this.subscriptionType = data.subscriptionType;
      this.createForm();
      this.card = await this.paymentService.initCard(this.card);
    });

    this.stateService.getStates().subscribe(states => this.states = states);
  }

  private createForm() {
    this.subscriptionForm = new FormGroup({
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

  subscribe() {
    if (this.validateForm()) {
      this.disableSubmit = true;
      return this.paymentService.createCardToken({
        card: this.card,
        firstName: this.subscriptionForm.get('firstName').value,
        lastName: this.subscriptionForm.get('lastName').value,
        address1: this.subscriptionForm.get('address1').value,
        address2: this.subscriptionForm.get('address2').value,
        city: this.subscriptionForm.get('city').value,
        state: this.subscriptionForm.get('state').value,
        zip: this.subscriptionForm.get('zip').value,
      })
      .pipe(untilDestroyed(this)).subscribe(result => {
        this.disableSubmit = false;
        if (result.token) {
          this.chargeSubscription(result.token.id);
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
    this.messageSent = false;
    if (!this.subscriptionForm.valid) {
      this.formUtil.validateAllFormFields(this.subscriptionForm);
      this.scrollToError();
      this.formStatusClass = '';
    }
    return this.subscriptionForm.valid;
  }

  chargeSubscription(token) {
    this.disableSubmit = true;
    this.paymentService.addSubscription(this.publication.id, this.getSubscriptionData(token)).subscribe(
      () => {
        this.disableSubmit = false;
        this.formStatusClass = '';
        this.messageSent = true;
        this.subscriptionForm.reset();
        this.card.clear();
        // this.router.navigateByUrl('dashboard');
      },
      errorData => {
        this.disableSubmit = false;
        this.pageService.scrollTo('.simple-page-form');
        this.errorApi = this.alertService.errorApiToString(errorData);
        this.formStatusClass = '';
      }
    );
  }

  private getSubscriptionData(token) {
    const data = {
      subscriptionType: this.subscriptionType.id,
      amount: this.subscriptionType.chargeAmount,
      email: this.subscriptionForm.get('email').value,
      name: this.subscriptionForm.get('firstName').value,
      lastName: this.subscriptionForm.get('lastName').value,
      stripeToken: token,
      mailingAddress: {
        addressedTo: this.subscriptionForm.get('firstName').value + ' ' + this.subscriptionForm.get('lastName').value,
        address1: this.subscriptionForm.get('address1').value,
        address2: this.subscriptionForm.get('address2').value ? this.subscriptionForm.get('address2').value : '',
        city: this.subscriptionForm.get('city').value,
        state: this.subscriptionForm.get('state').value,
        zip: this.subscriptionForm.get('zip').value,
        phone: this.subscriptionForm.get('phoneNumber').value ? this.subscriptionForm.get('phoneNumber').value : '',
        shipTo: ''
      }
    };
    return data;
  }

  private scrollToError() {
    let target = '';

    if (this.subscriptionForm.get('firstName').invalid || this.subscriptionForm.get('lastName').invalid) {
      target = '.group-name';
    } else if (this.subscriptionForm.get('email').invalid) {
      target = '.group-email';
    } else if (this.subscriptionForm.get('address1').invalid) {
      target = '.group-message';
    } else if (this.subscriptionForm.get('city').invalid || this.subscriptionForm.get('state').invalid) {
      target = '.group-state';
    } else {
      target = '.group-zip';
    }
    this.pageService.scrollTo(target);
  }

  ngOnDestroy() {}
}
