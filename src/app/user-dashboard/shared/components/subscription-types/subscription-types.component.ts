import { Component, Inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms/';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { SubscriptionSummaryResolverService } from 'user-dashboard/shared/resolvers/subscriptions-summary-resolver.service';
import { SubscriptionSummaryItem, SubscriptionType } from '_models';
import { Publication } from '_models/publication.model';
import { SubscriptionSummary } from '_models/subscription-summary.model';
import { FundraisingService } from '_services';
import { BaseActionsService } from '_services/base-actions.service';
import { AlertService } from '_shared/services';
import { TableBaseComponent } from '../table-base/table-base.component';

export interface SubscriptionTypeEntryData {
  publication: Publication;
  subscriptionSummary: SubscriptionSummary;
}

@Component({
  selector: 'app-subscription-types',
  templateUrl: './subscription-types.component.html',
})
export class SubscriptionTypesComponent
  extends TableBaseComponent
  implements OnDestroy {
  subscriptionTypeForm: FormGroup;
  publication: Publication;
  subscriptionTypes: Array<SubscriptionType> = [];
  editId = '';
  dataSource: MatTableDataSource<SubscriptionType>;
  displayedColumns: string[] = [
    'name',
    'content',
    'amount',
    'active',
    'actions',
  ];
  formActive = false;

  constructor(
    public dialogRef: MatDialogRef<SubscriptionTypesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SubscriptionTypeEntryData,
    private formBuilder: FormBuilder,
    private subscriptionsResolverService: SubscriptionSummaryResolverService,
    private fundraisingService: FundraisingService,
    private alertService: AlertService,
    private baseActionsService: BaseActionsService
  ) {
    super();
    this.publication = data.publication;
    this.loadData(data.subscriptionSummary);
    this.subscriptionTypeForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      content: ['', [Validators.required]],
      amount: [0, [Validators.required]],
      active: [true, [Validators.required]],
    });

    if (!this.subscriptionTypes.length) {
      this.addSubscriptionType();
    }
  }

  reload() {
    this.subscriptionsResolverService
      .resolve2(this.publication.id)
      .pipe(untilDestroyed(this))
      .subscribe((subscriptionSummary: SubscriptionSummary) => {
        this.loadData(subscriptionSummary);
        console.log('Subscriptions reloaded!');
      });
  }

  loadData(data: SubscriptionSummary) {
    this.subscriptionTypes = data.perType.map(
      (o: SubscriptionSummaryItem) => o.subscriptionType
    );
    // TODO: Temporal removal of Self Managed type
    this.subscriptionTypes = this.subscriptionTypes.filter(
      (o) => o.name !== 'Self Managed'
    );
    console.log(this.subscriptionTypes);
    this.dataSource = new MatTableDataSource(this.subscriptionTypes);
  }

  addSubscriptionType() {
    this.disableAllEdits();
    this.subscriptionTypeForm.reset();
    this.subscriptionTypeForm.get('active').setValue(true);
    const subscription = new SubscriptionType().deserialize({
      id: '0',
      name: '',
      content: '',
      amount: 0,
      editActive: true,
    });
    this.formActive = true;
    subscription.active = true;
    this.subscriptionTypes.push(subscription);
    this.dataSource = new MatTableDataSource(this.subscriptionTypes);
  }

  editSubscriptionType(id: string) {
    console.log(id);
    this.disableAllEdits();
    const subscription = this.subscriptionTypes.find((o) => o.id === id);
    this.subscriptionTypeForm.patchValue(subscription);
    this.formActive = subscription.active;
    subscription.editActive = true;
  }

  uniqueNameValidation() {
    return (
      this.subscriptionTypes.find(
        (o) => o.name === this.subscriptionTypeForm.get('name').value
      ) === undefined
    );
  }

  saveSubscriptionType(id: string) {
    console.log(id);
    if (id === '0') {
      if (!this.uniqueNameValidation()) {
        this.alertService.showAlertDanger(
          'You cannot use the same name for multiple subscription types'
        );
        this.subscriptionTypeForm.get('name').setErrors({ notUnique: true });
      } else {
        const data = {
          name: this.subscriptionTypeForm.get('name').value,
          content: this.subscriptionTypeForm.get('content').value,
          amount: parseFloat(this.subscriptionTypeForm.get('amount').value),
        };
        this.fundraisingService
          .createSubscriptionType(this.publication.id, data)
          .subscribe(
            () => {
              this.subscriptionTypeForm.reset();
              this.disableAllEdits();
              this.alertService.showAlertSuccess('Subscription Type created.');
              this.reload();
            },
            (errorData) => {
              this.alertService.showAlertDangerApiError(errorData);
            }
          );
      }
    } else {
      const data = {
        name: this.subscriptionTypeForm.get('name').value,
        content: this.subscriptionTypeForm.get('content').value,
        amount: parseFloat(this.subscriptionTypeForm.get('amount').value),
        active: this.subscriptionTypeForm.get('active').value,
      };

      this.fundraisingService
        .editSubscriptionType(this.publication.id, id, data)
        .subscribe(
          () => {
            this.subscriptionTypeForm.reset();
            this.disableAllEdits();
            this.alertService.showAlertSuccess('Subscription Type saved.');
            this.reload();
          },
          (errorData) => {
            this.alertService.showAlertDangerApiError(errorData);
          }
        );
    }
  }

  cancelEdit(id: string) {
    this.formActive = false;
    if (id === '0') {
      this.subscriptionTypes = this.subscriptionTypes.filter(
        (v, i, arr) => v.id !== '0'
      );
      this.dataSource = new MatTableDataSource(this.subscriptionTypes);
    } else {
      this.subscriptionTypeForm.reset();
      this.disableAllEdits();
    }
  }

  deleteSubscriptionType(id: string) {
    console.log(id);
    this.baseActionsService.confirmAction(
      {
        msg: 'Are you sure you want to delete this subscription type?',
        okBtnTxt: 'Confirm delete',
        cancelBtnTxt: 'Cancel',
      },
      {
        obs: this.fundraisingService.deleteSubscriptionType(
          this.publication.id,
          id
        ),
        cb: () => {
          this.alertService.showAlertSuccess('Subscription Type deleted.');
          this.disableAllEdits();
          this.reload();
        },
      }
    );
  }

  disableAllEdits() {
    this.formActive = false;
    this.subscriptionTypes = this.subscriptionTypes.map((o) => {
      o.editActive = false;
      return o;
    });
  }

  onClose(): void {
    this.disableAllEdits();
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
  }
}
