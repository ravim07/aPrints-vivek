import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { Observable } from 'rxjs';
import { StoreService } from 'user-dashboard/shared/state';
import { Publication } from '_models/publication.model';
import { PublicationService, StatesService } from '_services';
import { AlertService } from '_shared/services';

@Component({
  selector: 'app-mailing-prefs',
  templateUrl: './mailing-prefs.component.html',
  styleUrls: [
    '../../shared/components/issue-base/issue-base.component.scss',
    './mailing-prefs.component.scss',
  ],
  host: {
    class: 'd-flex flex-column flex-fill',
  },
  encapsulation: ViewEncapsulation.None,
})
export class MailingPrefsComponent implements OnInit, OnDestroy {
  publication: Publication;
  mailingAddressForm: FormGroup;
  states: Observable<any>;

  // INPUTS
  addressToInput: FormControl;
  phoneInput: FormControl;
  address1Input: FormControl;
  address2Input: FormControl;
  cityInput: FormControl;
  stateInput: FormControl;
  zipInput: FormControl;

  constructor(
    private route: ActivatedRoute,
    private publicationService: PublicationService,
    public statesService: StatesService,
    private alertService: AlertService,
    public storeService: StoreService
  ) {}

  ngOnInit(): void {
    this.states = this.statesService.getStates();
    this.storeService.currentPublication
      .pipe(untilDestroyed(this))
      .subscribe((pub) => {
        this.loadData(pub);
      });
  }

  reload() {
    this.storeService
      .refreshPublication(this.route.snapshot.paramMap.get('publicationId'))
      .pipe(untilDestroyed(this))
      .subscribe((pub) => {
        this.loadData(pub);
        console.log('Publication loaded!');
      });
  }

  loadData(publication) {
    this.publication = publication; // console.log(this.publication);
    this.createForm();
  }

  createForm() {
    const hasAddress = this.publication.mailingAddress;
    this.addressToInput = new FormControl(
      hasAddress ? this.publication.mailingAddress.addressedTo : '',
      [Validators.required]
    );
    this.phoneInput = new FormControl(
      hasAddress ? this.publication.mailingAddress.phone : '',
      [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
        Validators.minLength(10),
        Validators.maxLength(10),
      ]
    );
    this.address1Input = new FormControl(
      hasAddress ? this.publication.mailingAddress.address1 : '',
      [Validators.required]
    );
    this.address2Input = new FormControl(
      hasAddress ? this.publication.mailingAddress.address2 : '',
      // [Validators.required]
    );
    this.cityInput = new FormControl(
      hasAddress ? this.publication.mailingAddress.city : '',
      [Validators.required]
    );
    this.stateInput = new FormControl(
      hasAddress ? this.publication.mailingAddress.state : '',
      [Validators.required]
    );
    this.zipInput = new FormControl(
      hasAddress ? this.publication.mailingAddress.zip : '',
      [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
        Validators.minLength(5),
        Validators.maxLength(7),
      ]
    );
    this.mailingAddressForm = new FormGroup({
      addressedTo: this.addressToInput,
      phone: this.phoneInput,
      address1: this.address1Input,
      address2: this.address2Input,
      city: this.cityInput,
      state: this.stateInput,
      zip: this.zipInput,
    });

    if (hasAddress) {
      this.mailingAddressForm.markAllAsTouched();
    }
  }

  formValidator(form: FormGroup) {}

  save() {
    this.publicationService
      .updatePublication(this.publication.id, {
        mailingAddress: this.mailingAddressForm.value,
      })
      .subscribe(
        (pub: Publication) => {
          this.reload();
          this.alertService.showAlertSuccess('Mailing address saved.');
        },
        (errorData: any) => {
          this.alertService.showAlertDanger(
            'An error has occurred. Changes were not saved.'
          );
          console.log(errorData);
        }
      );
  }

  cancel() {}

  onPublicationHeaderEvent(event) {
    console.log(event, 'Menu event!');
    if (event === 'reload') {
      this.reload();
    }
  }

  getErrorMessage(formControl: FormControl, str: string) {
    if (formControl.hasError('required')) {
      return str.charAt(0).toUpperCase() + str.slice(1) + ' is required';
    } else if (formControl.hasError('pattern')) {
      return `You must enter a valid ${str}`;
    } else if (
      formControl.hasError('minlength') ||
      formControl.hasError('maxlength')
    ) {
      return `You must enter a valid ${str}`;
    }
  }

  ngOnDestroy(): void {}
}
