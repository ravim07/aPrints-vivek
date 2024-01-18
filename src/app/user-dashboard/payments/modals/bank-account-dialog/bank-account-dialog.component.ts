import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { AuthService } from 'auth/auth.service';
import { PaymentService, PublicationService, StatesService } from '_services';
import { LoadingService } from '_services/loading.service';
import { AlertService } from '_shared/services';
import { switchMap } from 'rxjs/operators';
import { of, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-bank-account',
  templateUrl: './bank-account-dialog.component.html',
  styleUrls: ['./bank-account-dialog.component.scss']
})
export class BankAccountDialogComponent implements OnInit {
  bankAccountForm: FormGroup;
  personalInfoForm: FormGroup;

  accountHolderTypes: Array<string> = ['Individual', 'Company'];
  bankAccount;
  currentStep = 1;
  currentUser = this.authService.getCurrentUser();
  states = this.statesService.getStates();
  publicationId: string;

  isProduction = !!environment.production;

  constructor(private formBuilder: FormBuilder,
              private authService: AuthService,
              private paymentService: PaymentService,
              private loadingService: LoadingService,
              private alertService: AlertService,
              private statesService: StatesService,
              private publicationService: PublicationService,
              private dialogRef: MatDialogRef<BankAccountDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data,
  ) {
    this.publicationId = data.publicationId;
  }

  ngOnInit() {
    this.bankAccountForm = this.formBuilder.group({
      // accountHolderType: [null, [Validators.required]],
      firstName: [this.currentUser.name, [Validators.required]],
      lastName: [this.currentUser.lastName, [Validators.required]],
      accountNumber: [null, [Validators.required]],
      routingNumber: [null, [Validators.required]]
    });

    this.personalInfoForm = this.formBuilder.group({
      email: [{
        value: this.currentUser.email,
        disabled: true
      }, [Validators.required]],
      firstName: [this.currentUser.name, [Validators.required]],
      lastName: [this.currentUser.lastName, [Validators.required]],
      phone: [null, [Validators.required]],
      dob: ['1985-01-01', [Validators.required]], // Date of birth
      gender: [null, [Validators.required]],
      ssn: [null, [Validators.required]],
      address: this.formBuilder.group({
        city: [null, [Validators.required]],
        country: [{
          value: 'US',
          disabled: true
        }, [Validators.required]],
        line1: [null, [Validators.required]],
        line2: [null, []],
        postal_code: [null, [Validators.required]],
        state: [null, [Validators.required]]
      }),
      website: [null, [Validators.required]],
      // mcc: [null, [Validators.required]],
    });


    if (!this.isProduction) {
      this.bankAccountForm.patchValue({
        accountNumber: '000123456789',
        routingNumber: '110000000'
      });
      this.personalInfoForm.patchValue({
        ssn: '0000',
      });
    }
  }

  saveAccount() {
    if (this.bankAccountForm.invalid || [this.personalInfoForm.invalid]) {

    }
    this.loadingService.showAnimation('Setting up Account', `We're setting up your bank account...`);
    this.paymentService.createBankAccountToken({ ...this.bankAccountForm.getRawValue() })
      .pipe(switchMap((result) => {
        if (result.token) {
          return of(result.token);
        }
        if (result.error) {
          return throwError(result);
        }
      }))
      .pipe(switchMap((token) => {
        const data = {
          stripeToken: token,
          personalInfo: this.personalInfoForm.getRawValue()
        };
        return this.publicationService.createStripeAccount(this.publicationId, {
          ...data,
        });
      }))
      .subscribe(result => {
          if (result) {
            this.loadingService.hideAnimation();
            this.dialogRef.close(result);
          }
        },
        (error: any) => {
          this.loadingService.hideAnimation();
          this.alertService.showAlertDanger(error.error.message);
        });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  prevStep() {
    this.currentStep--;
  }

  nextStep() {
    this.currentStep++;
  }

}
