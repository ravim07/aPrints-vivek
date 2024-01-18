import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { AlertService } from '_shared/services';
import { formOptions } from '_models';
import { ContactService } from '_services/contact.service';
import { FormUtilService, PageService } from '_shared/services';
import { StatesService } from '_services';

@Component({
  selector: 'app-request-sample',
  templateUrl: './request-sample.component.html',
  styleUrls: ['./request-sample.component.scss']
})
export class RequestSampleComponent implements OnInit {
  requestForm: FormGroup;
  formStatusClass = '';
  errorApi = '';
  messageSent = false;
  formOptions;
  states: Array<string> = [];

  constructor(
    public formUtil: FormUtilService,
    private pageService: PageService,
    private contactService: ContactService,
    private alertService: AlertService,
    private stateService: StatesService
  ) {
    this.formOptions = formOptions;
  }

  ngOnInit() {
    this.createContactForm();
    this.stateService.getStates().subscribe(states => this.states = states);
  }

  saveContact() {
    this.formStatusClass = 'form-inprogress-submit';
    this.errorApi = '';
    this.messageSent = false;

    if (this.requestForm.valid) {
      const data = {
        fullName: this.requestForm.get('fullName').value,
        email: this.requestForm.get('email').value,
        phoneNumber: this.requestForm.get('phoneNumber').value,
        address1: this.requestForm.get('address1').value,
        address2: this.requestForm.get('address2').value,
        city: this.requestForm.get('city').value,
        state: this.requestForm.get('state').value,
        zip: this.requestForm.get('zip').value,
        publicationName: this.requestForm.get('publicationName').value
      };
      // console.log(data);
      this.contactService.sendRequestSample(data).subscribe(
        () => {
          this.formStatusClass = '';
          this.messageSent = true;
          this.requestForm.reset();
          this.pageService.scrollTo('.simple-page-form');
        },
        (errorData: any) => {
          // console.error('Error', errorData);
          this.pageService.scrollTo('.simple-page-form');
          this.errorApi = this.alertService.errorApiToString(errorData);
          this.formStatusClass = '';
        }
      );
    } else {
      this.formUtil.validateAllFormFields(this.requestForm);
      this.formStatusClass = '';
    }
  }

  private createContactForm() {
    this.requestForm = new FormGroup({
      'publicationName': new FormControl(null),
      'fullName': new FormControl(null, [Validators.required]),
      'email': new FormControl(null, [Validators.required, Validators.email]),
      'phoneNumber': new FormControl(null),
      'address1': new FormControl('', [Validators.required]),
      'address2': new FormControl(''),
      'city': new FormControl(null, [Validators.required]),
      'state': new FormControl(null, [Validators.required]),
      'zip': new FormControl(null, [Validators.required, Validators.pattern(/^[0-9]{5}(?:-[0-9]{4})?$/)]),
    });
  }
}
