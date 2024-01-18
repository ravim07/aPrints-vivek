import { Component, Inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms/';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { SponsorshipSummaryResolverService } from 'user-dashboard/shared/resolvers/sponsorships-summary-resolver.service';
import { DonationLevel, DonationSummaryItem } from '_models';
import { DonationSummary } from '_models/donation-summary.model';
import { Publication } from '_models/publication.model';
import { FundraisingService } from '_services';
import { BaseActionsService } from '_services/base-actions.service';
import { AlertService } from '_shared/services';
import { TableBaseComponent } from '../table-base/table-base.component';

export interface SponsorshipLevelEntryData {
  publication: Publication;
  sponsorshipSummary: DonationSummary;
}

@Component({
  selector: 'app-sponsorships-levels',
  templateUrl: './sponsorships-levels.component.html',
})
export class SponsorshipsLevelsComponent
  extends TableBaseComponent
  implements OnDestroy {
  donationLevelForm: FormGroup;
  publication: Publication;
  donationLevels: Array<DonationLevel> = [];
  editId = '';
  dataSource: MatTableDataSource<DonationLevel>;
  displayedColumns: string[] = [
    'name',
    'content',
    'amount',
    'active',
    'actions',
  ];
  formActive = false;

  constructor(
    public dialogRef: MatDialogRef<SponsorshipsLevelsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SponsorshipLevelEntryData,
    private formBuilder: FormBuilder,
    private sponsorshipResolverService: SponsorshipSummaryResolverService,
    private fundraisingService: FundraisingService,
    private alertService: AlertService,
    private baseActionsService: BaseActionsService
  ) {
    super();
    this.publication = data.publication;
    this.loadData(data.sponsorshipSummary);
    this.donationLevelForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      content: ['', [Validators.required]],
      amount: [0, [Validators.required]],
      active: [true, [Validators.required]],
    });
    if (this.donationLevels.length === 1 && this.donationLevels[0].id === 'customAmount') {
      this.addDonationLevel();
    }
  }

  reload() {
    this.sponsorshipResolverService
      .resolve2(this.publication.id)
      .pipe(untilDestroyed(this))
      .subscribe((sponsorshipSummary: DonationSummary) => {
        this.loadData(sponsorshipSummary);
        console.log('Subscriptions reloaded!');
      });
  }

  loadData(data: DonationSummary) {
    this.donationLevels = data.perLevel.map((o: DonationSummaryItem) => {
      if (o.donationLevel.content === 'Custom amount') {
        o.donationLevel.content = 'An amount of your choice';
      }
      return o.donationLevel;
    });
    this.dataSource = new MatTableDataSource(this.donationLevels);
  }

  addDonationLevel() {
    this.disableAllEdits();
    this.donationLevelForm.reset();
    this.donationLevelForm.get('active').setValue(true);
    const donation = new DonationLevel().deserialize({
      id: '0',
      name: '',
      content: '',
      amount: 0,
      editActive: true,
    });
    this.formActive = true;
    donation.active = true;
    this.donationLevels.push(donation);
    this.dataSource = new MatTableDataSource(this.donationLevels);
  }

  editDonationLevel(id: string) {
    console.log(id);
    this.disableAllEdits();
    const donation = this.donationLevels.find((o) => o.id === id);
    this.donationLevelForm.patchValue(donation);
    this.formActive = donation.active;
    donation.editActive = true;
  }

  uniqueNameValidation(): boolean {
    return (
      this.donationLevels.find(
        (o) => o.name === this.donationLevelForm.get('name').value
      ) === undefined
    );
  }

  saveDonationLevel(id: string) {
    console.log(id);
    if (id === '0') {
      if (!this.uniqueNameValidation()) {
        this.alertService.showAlertDanger(
          'You cannot use the same name for multiple subscription types'
        );
        this.donationLevelForm.get('name').setErrors({ notUnique: true });
      } else {
        const data = {
          name: this.donationLevelForm.get('name').value,
          content: this.donationLevelForm.get('content').value,
          amount: parseFloat(this.donationLevelForm.get('amount').value),
        };
        this.fundraisingService
          .createDonationlevel(this.publication.id, data)
          .subscribe(
            () => {
              this.donationLevelForm.reset();
              this.disableAllEdits();
              this.alertService.showAlertSuccess('Donation Level created.');
              this.reload();
            },
            (errorData) => {
              this.alertService.showAlertDangerApiError(errorData);
            }
          );
      }
    } else {
      const data = {
        name: this.donationLevelForm.get('name').value,
        content: this.donationLevelForm.get('content').value,
        amount: parseFloat(this.donationLevelForm.get('amount').value),
        active: this.donationLevelForm.get('active').value,
      };

      this.fundraisingService
        .editDonationLevel(this.publication.id, id, data)
        .subscribe(
          () => {
            this.donationLevelForm.reset();
            this.disableAllEdits();
            this.alertService.showAlertSuccess('Donation Level saved.');
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
      this.donationLevels = this.donationLevels.filter(
        (v, i, arr) => v.id !== '0'
      );
      this.dataSource = new MatTableDataSource(this.donationLevels);
    } else {
      this.donationLevelForm.reset();
      this.disableAllEdits();
    }
  }

  deleteDonationLevel(id: string) {
    this.baseActionsService.confirmAction(
      {
        msg: 'Are you sure you want to delete this donation level?',
        okBtnTxt: 'Confirm delete',
        cancelBtnTxt: 'Cancel',
      },
      {
        obs: this.fundraisingService.deleteDonationLevel(
          this.publication.id,
          id
        ),
        cb: () => {
          this.alertService.showAlertSuccess('Donation Level deleted.');
          this.disableAllEdits();
          this.reload();
        },
      }
    );
  }

  disableAllEdits() {
    this.formActive = false;
    this.donationLevels = this.donationLevels.map((o) => {
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
