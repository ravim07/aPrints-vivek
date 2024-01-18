import { Component, OnInit, /*ViewChild, ElementRef,*/ OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, /*Router*/ } from '@angular/router';

import { AlertService } from '_shared/services';
import { StatesService, FundraisingService, PaymentService } from '_services';
import { FormUtilService, PageService } from '_shared/services';
import { PublicationPreview, DonationLevel } from '_models';

import { environment } from '../../../environments/environment';

import { Element as StripeElement } from 'ngx-stripe';
import { untilDestroyed } from 'ngx-take-until-destroy';

@Component({
  selector: 'app-donate',
  templateUrl: './donate.component.html',
  styleUrls: ['./donate.component.scss']
})
export class DonateComponent implements OnInit, OnDestroy {
  publication: PublicationPreview;
  level: DonationLevel;
  donationForm: FormGroup;
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
    private paymentService: PaymentService
  ) { }

  ngOnInit() {
    this.route.data.pipe(untilDestroyed(this)).subscribe(async data => {
      this.publication = data.publication;
      this.level = data.level;
      this.createForm();
      this.card = await this.paymentService.initCard(this.card);
    });

    this.stateService.getStates().subscribe(states => this.states = states);
  }

  private createForm() {
    this.donationForm = new FormGroup({
      'firstName': new FormControl(null, [Validators.required]),
      'lastName': new FormControl(null, [Validators.required]),
      'email': new FormControl(null, [Validators.required, Validators.email]),
      'phoneNumber': new FormControl(null),
      'address1': new FormControl('', [Validators.required]),
      'address2': new FormControl(''),
      'city': new FormControl(null, [Validators.required]),
      'state': new FormControl(null, [Validators.required]),
      'zip': new FormControl(null, [Validators.required, Validators.pattern(/^[0-9]{5}(?:-[0-9]{4})?$/)]),
      'amount': new FormControl(null, [Validators.required]),
    });
    if (this.level.id !== 'customAmount') {
      this.donationForm.get('amount').clearValidators();
    }
  }

  donate() {
    if (this.validateForm()) {
      return this.paymentService.createCardToken({
        card: this.card,
        firstName: this.donationForm.get('firstName').value,
        lastName: this.donationForm.get('lastName').value,
        address1: this.donationForm.get('address1').value,
        address2: this.donationForm.get('address2').value,
        city: this.donationForm.get('city').value,
        state: this.donationForm.get('state').value,
        zip: this.donationForm.get('zip').value,
      })
      .pipe(untilDestroyed(this)).subscribe(result => {
        if (result.token) {
          this.chargeDonation(result.token.id);
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
    if (!this.donationForm.valid) {
      this.formUtil.validateAllFormFields(this.donationForm);
      this.scrollToError();
      this.formStatusClass = '';
    }
    return this.donationForm.valid;
  }

  chargeDonation(token) {
    this.disableSubmit = true;
    this.paymentService.addDonation(this.publication.id, this.getDonationData(token)).subscribe(
      () => {
        this.disableSubmit = false;
        this.formStatusClass = '';
        this.messageSent = true;
        this.donationForm.reset();
        this.card.clear();
        this.pageService.scrollTo('.simple-page-form');
      },
      errorData => {
        this.disableSubmit = false;
        this.pageService.scrollTo('.simple-page-form');
        this.errorApi = this.alertService.errorApiToString(errorData);
        this.formStatusClass = '';
      }
    );
  }

  private getDonationData(token) {
    const data = {
      donationLevel: this.level.id,
      amount: this.level.amount,
      email: this.donationForm.get('email').value,
      name: this.donationForm.get('firstName').value,
      lastName: this.donationForm.get('lastName').value,
      stripeToken: token,
      mailingAddress: {
        addressedTo: this.donationForm.get('firstName').value + ' ' + this.donationForm.get('lastName').value,
        address1: this.donationForm.get('address1').value,
        address2: this.donationForm.get('address2').value ? this.donationForm.get('address2').value : '',
        city: this.donationForm.get('city').value,
        state: this.donationForm.get('state').value,
        zip: this.donationForm.get('zip').value,
        phone: this.donationForm.get('phoneNumber').value ? this.donationForm.get('phoneNumber').value : '',
        shipTo: ''
      }
    };
    return data;
  }

  private scrollToError() {
    let target = '';

    if (this.donationForm.get('firstName').invalid || this.donationForm.get('lastName').invalid) {
      target = '.group-name';
    } else if (this.donationForm.get('email').invalid) {
      target = '.group-email';
    } else if (this.donationForm.get('address1').invalid) {
      target = '.group-message';
    } else if (this.donationForm.get('city').invalid || this.donationForm.get('state').invalid) {
      target = '.group-state';
    } else {
      target = '.group-zip';
    }
    this.pageService.scrollTo(target);
  }

  calculateTotals() {
    this.level.calculateTotalAndFees(this.donationForm.get('amount').value);
    // console.log(this.level);
  }

  ngOnDestroy() {}
}
