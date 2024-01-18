import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { AlertService } from '_shared/services';
import { formOptions } from '_models';
import { ContactService } from '_services/contact.service';
import { FormUtilService, PageService } from '_shared/services';

@Component({
  selector: 'app-quote',
  templateUrl: './quote.component.html',
  styleUrls: ['./quote.component.scss']
})
export class QuoteComponent implements OnInit {
  quoteForm: FormGroup;
  printingPreferencesGroup: FormGroup;
  formStatusClass = '';
  errorApi = '';
  messageSent = false;
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
    this.createQuoteForm();
  }

  saveQuote() {
    this.formStatusClass = 'form-inprogress-submit';
    this.errorApi = '';
    this.messageSent = false;

    if (this.quoteForm.valid) {
      const data = Object.assign({}, this.quoteForm.value);
      this.cleanData(data);

      this.contactService.createQuote(data).subscribe(
        () => {
          this.formStatusClass = '';
          this.messageSent = true;
          this.quoteForm.reset();
          this.pageService.scrollTo('.simple-page-form');
        },
        (errorData: any) => {
          this.errorApi = this.alertService.errorApiToString(errorData);
          this.formStatusClass = '';
          this.pageService.scrollTo('.simple-page-form');
        }
      );
    } else {
      this.formUtil.validateAllFormFields(this.quoteForm);
      this.scrollToError();
      this.formStatusClass = '';
    }
  }

  scrollToError() {
    let target = '';

    if (this.quoteForm.get('publicationName').invalid || this.quoteForm.get('email').invalid) {
      target = '.group-publication';
    } else if (this.quoteForm.get('fullName').invalid) {
      target = '.group-name';
    } else if (this.quoteForm.get('printingPreferences').get('orderSize').invalid) {
      target = '.group-size';
    }

    this.pageService.scrollTo(target);
  }

  private cleanData(data: any) {
    Object.keys(data).forEach(function (key) {
      if (key !== 'printingPreferences' && !data[key]) {
        delete data[key];
      }
    });

    Object.keys(data.printingPreferences).forEach(function (key) {
      if (!data.printingPreferences[key]) {
        delete data.printingPreferences[key];
      }
    });
  }

  private createQuoteForm() {
    this.printingPreferencesGroup = new FormGroup({
      'trim': new FormControl(),
      'cover': new FormControl(),
      'paperStock': new FormControl(),
      'pageCount': new FormControl(),
      'orderSize': new FormControl(null, [Validators.required]),
      'turnaround': new FormControl(),
    });

    this.quoteForm = new FormGroup({
      'publicationName': new FormControl(null, [Validators.required]),
      'email': new FormControl(null, [Validators.required, Validators.email]),
      'publicationType': new FormControl(),
      'phoneNumber': new FormControl(),
      'fullName': new FormControl(null, [Validators.required]),
      'numberIssues': new FormControl(),
      'content': new FormControl(null),
      'printingPreferences': this.printingPreferencesGroup
    });
  }
}
