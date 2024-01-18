import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { AlertService } from '_shared/services';
import { formOptions } from '_models';
import { ContactService } from '_services/contact.service';
import { FormUtilService, PageService } from '_shared/services';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  formStatusClass = '';
  errorApi = '';
  messageSent = false;
  pageTitle = '';
  formOptions;

  constructor(
    public formUtil: FormUtilService,
    private pageService: PageService,
    private contactService: ContactService,
    private alertService: AlertService
  ) {
    this.formOptions = formOptions;
  }

  ngOnInit() {
    this.createContactForm();
  }

  saveContact() {
    this.formStatusClass = 'form-inprogress-submit';
    this.errorApi = '';
    this.messageSent = false;

    if (this.contactForm.valid) {
      const data = Object.assign({}, this.contactForm.value);
      this.cleanData(data);

      this.contactService.createContactForm(data).subscribe(
        () => {
          this.formStatusClass = '';
          this.messageSent = true;
          this.contactForm.reset();
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
      this.formUtil.validateAllFormFields(this.contactForm);
      this.scrollToError();
      this.formStatusClass = '';
    }
  }

  scrollToError() {
    let target = '';

    if (this.contactForm.get('publicationName').invalid || this.contactForm.get('email').invalid) {
      target = '.group-publication';
    } else if (this.contactForm.get('fullName').invalid) {
      target = '.group-name';
    } else if (this.contactForm.get('content').invalid) {
      target = '.group-message';
    }

    this.pageService.scrollTo(target);
  }

  private cleanData(data: any) {
    Object.keys(data).forEach(function (key) {
      if (key !== 'printingPreferences' && !data[key]) {
        delete data[key];
      }
    });
  }

  private createContactForm() {
    this.contactForm = new FormGroup({
      'publicationName': new FormControl(null, [Validators.required]),
      'email': new FormControl(null, [Validators.required, Validators.email]),
      'publicationType': new FormControl(null),
      'phoneNumber': new FormControl(null),
      'fullName': new FormControl(null, [Validators.required]),
      'content': new FormControl(null, [Validators.required])
    });
  }
}
