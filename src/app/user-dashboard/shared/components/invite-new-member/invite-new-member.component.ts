import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms/';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from 'environments/environment';
import { copyToClipboard } from 'user-dashboard/shared/services/utils';
import { role } from '_models';
import { AlertService } from '_shared/services';

interface InviteNewMemberDialogData {
  url: string;
  queryParams: string;
  csvDialogName: string;
  manualDialogName: string;
  roleStr: string;
  hideFooter?: boolean;
}

@Component({
  templateUrl: './invite-new-member.component.html',
})
export class InviteNewMemberComponent {
  newMemberInviteForm: FormGroup;
  link: string;
  roleStr: string;

  constructor(
    public dialogRef: MatDialogRef<InviteNewMemberComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InviteNewMemberDialogData,
    private alertService: AlertService,
    private formBuilder: FormBuilder
  ) {
    this.newMemberInviteForm = this.formBuilder.group({
      email: ['', [Validators.required]],
    });
    this.link = 'https://aprintis.com/p/' + data.url;
    this.roleStr = role.getStrRole(data.roleStr);
  }

  save() {
    const emailArr = [this.newMemberInviteForm.value.email];
    this.dialogRef.close(emailArr);
  }

  copyUrl() {
    copyToClipboard(
      environment.frontBaseUrl + '/p/' + this.data.url + this.data.queryParams
    );
    this.alertService.showAlertSuccess('Link copied to clipboard.');
  }

  addViaCSV() {
    this.dialogRef.close(this.data.csvDialogName);
  }

  addManually() {
    this.dialogRef.close(this.data.manualDialogName);
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }
}
