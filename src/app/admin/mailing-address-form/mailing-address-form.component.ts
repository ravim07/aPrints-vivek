import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MailingAddress } from '_models';
import { IssueService, StatesService } from '_services';
import { AlertService } from '_shared/services';
import { Issue } from '_models/issue.model';

@Component({
  selector: 'admin-mailing-address-form',
  templateUrl: './mailing-address-form.component.html',
  styleUrls: ['./mailing-address-form.component.scss']
})
export class MailingAddressFormComponent implements OnInit {
  mailingAddressForm: FormGroup;
  states: string[] = [];
  @Input() issue: Issue;

  constructor(private formBuilder: FormBuilder,
              private issueService: IssueService,
              private alertService: AlertService,
              private stateService: StatesService) {
    this.mailingAddressForm = this.formBuilder.group({
      addressedTo: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      address1: ['', [Validators.required]],
      address2: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zip: ['', [Validators.required]],
    });
  }

  _mailingAddress: MailingAddress;

  get mailingAddress(): MailingAddress {
    return this._mailingAddress;
  }

  @Input() set mailingAddress(value: MailingAddress) {
    this._mailingAddress = new MailingAddress().deserialize(value);
    this.mailingAddressForm.patchValue(this._mailingAddress);
  }

  ngOnInit() {
    this.stateService.getStates().subscribe(states => this.states = states);
  }

  save() {
    if (this.mailingAddressForm.valid) {
      const mailingAddress = this.mailingAddressForm.getRawValue();
      this.issue.mailingAddress = mailingAddress;
      this.issueService
        .updateIssue(this.issue.id, this.issue)
        .subscribe((result) => {
          console.log(result);
          this.alertService.showAlertSuccess(
            'Mailing Address updated.'
          );
        });
    }
  }
}
