import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AlertService } from '_shared/services';
import { printingPreferencesOptions, User } from '_models';
import { Publication } from '_models/publication.model';
import { PublicationService, StatesService, UserService } from '_services';
import { FormUtilService, PageService } from '_shared/services';
import { UserPublicationsService, PublicationUrlService } from 'user-dashboard/shared/services';
import { AuthService } from 'auth/auth.service';

@Component({
  selector: 'app-print-now',
  templateUrl: './print-now.component.html',
  styleUrls: ['./print-now.component.scss']
})
export class PrintNowComponent implements OnInit {
  pubDates: Array<Date> = [];
  newPublicationForm: FormGroup;
  defaultPrintingPreferencesGroup: FormGroup;
  addressGroup: FormGroup;
  printingPreferencesOptions;
  formSubmitted = false;
  formStatusClass = '';
  errorApi = false;
  states: Array<string> = [];

  constructor(
    private userService: UserService,
    private authService: AuthService,
    public formUtil: FormUtilService,
    private publicationService: PublicationService,
    private userPublications: UserPublicationsService,
    private stateService: StatesService,
    private pageService: PageService,
    private publicationUrlService: PublicationUrlService,
    private alertService: AlertService,
    private router: Router
  ) { }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.printingPreferencesOptions = printingPreferencesOptions;
    this.createNewPublicationForm();

    this.stateService.getStates().subscribe(states => this.states = states);
  }

  private createNewPublicationForm() {
    this.defaultPrintingPreferencesGroup = new FormGroup({
      'trim': new FormControl(this.printingPreferencesOptions.trim[0].value),
      'insidePages': new FormControl(`${this.printingPreferencesOptions.insidePages[0].value}`),
      'numberOfCopies': new FormControl(`${this.printingPreferencesOptions.numberOfCopies[0].value}`),
      'color': new FormControl(this.printingPreferencesOptions.color[0].value),
      'cover': new FormControl(this.printingPreferencesOptions.cover[0].value),
      'binding': new FormControl(this.printingPreferencesOptions.binding[0].value)
    });

    this.addressGroup = new FormGroup({
      'organization': new FormControl(null, [Validators.required]),
      'addressedTo': new FormControl(null),
      'address1': new FormControl(null),
      'address2': new FormControl(null),
      'city': new FormControl(null),
      'state': new FormControl(null),
      'zip': new FormControl(null, [Validators.pattern(/^[0-9]{5}(?:-[0-9]{4})?$/)]),
      'phone': new FormControl(null),
    });

    this.newPublicationForm = new FormGroup({
      'pub-email': new FormControl(null, [Validators.required, Validators.email]),
      'pub-name': new FormControl(null, [Validators.required]),
      'description': new FormControl(null),
      'printingPreferences': this.defaultPrintingPreferencesGroup,
      'mailingAddress': this.addressGroup
    });
  }

  createPublication() {
    this.errorApi = false;
    this.formStatusClass = 'form-inprogress-submit';

    this.formSubmitted = true;
    if (this.newPublicationForm.valid && this.pubDates.length > 0) {
      let publication = new Publication();
      publication = Object.assign({}, this.newPublicationForm.value);
      delete publication['pub-name'];
      publication.name = this.newPublicationForm.get('pub-name').value;
      publication.schedule = this.pubDates;
      publication.mailingAddress.shipTo = 'Ship Bulk';
      const user = new User();
      user.email = this.newPublicationForm.get('pub-email').value.toLowerCase();
      user.userType = 'managingEditor';
      user.name = user.email;
      user.lastName = '';
      user.password = 'thisWillBeReplacedWithRandomOne';

      this.userService.registerFastUser(user)
        .subscribe(
          (newUser: User) => {
            if (newUser.name === 'ValidationError') {
              // console.log(newUser);
              this.alertService.showAlertDanger('The email already exists', 'bottom');
            } else {
              this.authService.login(newUser);
              this.publicationService.createPublication(publication)
              .subscribe(
                (newPublication: Publication) => {
                  this.userPublications.update();
                  this.formStatusClass = '';
                  if (newPublication.publicationIssues.length > 0) {
                    this.router.navigateByUrl(
                      this.publicationUrlService.getLinkViewIssue(newPublication, newPublication.publicationIssues[0].id));
                  } else {
                    this.router.navigateByUrl('/dashboard');
                  }
                },
                (errorData: any) => {
                  this.alertService.showAlertDangerApiError(errorData, 'bottom');
                }
              );
            }
          },
          (errorData: any) => {
            if (errorData.error.name === 'ValidationError') {
              console.log(errorData.error);
              this.alertService.showAlertDanger('The email already exists', 'bottom');
              this.errorApi = true;
            } else {
              console.error('Error', errorData);
              this.alertService.showAlertDangerApiError(errorData, 'bottom');
            }
          }
        );
    } else {
      this.formUtil.validateAllFormFields(this.newPublicationForm);
      this.scrollToError();
      this.formStatusClass = '';
    }
  }

  private scrollToError() {
    if (this.newPublicationForm.get('name').invalid || this.pubDates.length === 0) {
      this.pageService.scrollTo('.row-pub-name');
    } else if (this.addressGroup.get('organization').invalid) {
      this.pageService.scrollTo('.row-org-name');
    } else {
      this.pageService.scrollTo('.form');
    }
  }

  resetPassword() {
    this.userService.forgotPassword(this.newPublicationForm.get('email').value).subscribe(
      data => {
        this.alertService.showAlertSuccess('Forgot password email sent!', 'bottom');
      },
    );
  }
}
