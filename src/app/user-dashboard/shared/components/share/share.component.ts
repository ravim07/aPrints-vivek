import { Component, ElementRef, Inject, OnDestroy, ViewChild, } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from 'environments/environment';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { StoreService } from 'user-dashboard/shared/state/store.service';
import { Publication } from '_models/publication.model';
import { PermissionsService, PublicationService } from '_services';
import { AlertService } from '_shared/services';
import { permissionEnum } from '_models';

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
})
export class ShareComponent implements OnDestroy {
  value: string;
  communityInfo: FormGroup;
  @ViewChild('input', { static: true })
  inputEl: ElementRef;
  canEditShare;

  constructor(
    public dialogRef: MatDialogRef<ShareComponent>,
    private alertService: AlertService,
    private publicationService: PublicationService,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA)
    public publication: Publication,
    private storeService: StoreService,
    private permissionsService: PermissionsService,
  ) {
    this.value = `${ environment.frontBaseUrl }/p/${ publication.id }`;
    this.canEditShare = this.permissionsService.getPermission(
      permissionEnum.canEditShare,
      this.publication
    );
    this.communityInfo = this.formBuilder.group({
      title: [
        { value: publication.communityInfo.title, disabled: !this.canEditShare, },
        [Validators.required]
      ],
      description: [
        { value: publication.communityInfo.description, disabled: !this.canEditShare, },
        [Validators.required],
      ],
    });
  }

  copy() {
    try {
      if ((navigator as any).clipboard) {
        (navigator as any).clipboard.writeText(this.value);
      } else if ((window as any).clipboardData) {
        // IE
        (window as any).clipboardData.setData('text', this.value);
      } else {
        // other browsers, iOS, Mac OS
        this.copyToClipboard(this.inputEl.nativeElement);
      }
      this.alertService.showAlertSuccess('Link copied to clipboard.');
    } catch (e) {
      this.alertService.showAlertDanger(
        'Link copy failed. Try to copy manually'
      );
    }
  }

  save() {
    const pub = new Publication();
    pub.communityInfo = this.communityInfo.value;
    this.publicationService
      .updatePublication(this.publication.id, pub)
      .pipe(untilDestroyed(this))
      .subscribe(
        () => {
          this.storeService
            .refreshPublication(this.publication.id)
            .pipe(untilDestroyed(this))
            .subscribe(() =>
              this.alertService.showAlertSuccess('Saved changes.')
            );
        },
        (errorData: any) => {
          this.alertService.showAlertDanger(
            'An error has occurred. Changes were not saved.'
          );
          console.log(errorData);
        }
      );
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  ngOnDestroy() {
  }

  private copyToClipboard(el: HTMLInputElement) {
    const oldContentEditable = el.contentEditable;
    const oldReadOnly = el.readOnly;

    try {
      el.contentEditable = 'true'; // specific to iOS
      el.readOnly = false;
      this.copyNodeContentsToClipboard(el);
    } finally {
      el.contentEditable = oldContentEditable;
      el.readOnly = oldReadOnly;
    }
  }

  private copyNodeContentsToClipboard(el: HTMLInputElement) {
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(el);
    selection.removeAllRanges();

    selection.addRange(range);
    el.setSelectionRange(0, 999999);

    document.execCommand('copy');
  }
}
