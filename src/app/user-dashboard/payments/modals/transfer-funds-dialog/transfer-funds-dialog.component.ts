import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { ActionsService } from 'user-dashboard/shared/services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingService } from '_services/loading.service';
import { PaymentService } from '_services';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { catchError, switchMap } from 'rxjs/operators';
import { AlertService } from '_shared/services';
import { of, throwError } from 'rxjs';

@Component({
  selector: 'app-transfer-funds-dialog',
  templateUrl: './transfer-funds-dialog.component.html',
  styleUrls: ['./transfer-funds-dialog.component.scss']
})
export class TransferFundsDialogComponent implements OnInit {
  transferForm: FormGroup;
  publicationId;

  constructor(
    private dialogRef: MatDialogRef<TransferFundsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private loadingService: LoadingService,
    private paymentService: PaymentService,
    private actionsService: ActionsService) {
    this.publicationId = data.publicationId;
  }

  ngOnInit() {
    this.transferForm = this.formBuilder.group({
      amount: [null, [Validators.required, Validators.min(0)]],
      description: []
    });
  }

  transfer() {
    if (this.transferForm.invalid) {
      return;
    }
    const data = this.transferForm.getRawValue();

    const obsRequest$ =
      of(true).pipe(switchMap(() => {
        this.loadingService.showAnimation('Processing', `We're Processing your transfer...`);
        return this.paymentService.createPayout(this.publicationId, data)
          .pipe(catchError((error) => {
            this.loadingService.hideAnimation();
            this.alertService.showAlertDanger(error.error.message);
            return throwError(error);
          }));
      }));

    this.actionsService.confirmAction({
      title: 'Confirm',
      msg: 'Are you sure you want to transfer this amount?',
      okBtnTxt: 'Confirm',
      cancelBtnTxt: 'Cancel'
    }, {
      obs: obsRequest$,
      cb: (result) => {
        this.loadingService.hideAnimation();
        this.dialogRef.close(result);
      }
    });
  }

}
