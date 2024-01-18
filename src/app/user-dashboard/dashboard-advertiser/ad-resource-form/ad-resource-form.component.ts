import { Component, EventEmitter, Input, OnInit,
         Output, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdvertisingService } from '_services';
import { AdResource } from '_models/ad-resource.model';
import { AuthService } from 'auth/auth.service';
import { Lightbox } from 'ngx-lightbox';
import { MatDialog } from '@angular/material/dialog';
import { environment } from 'environments/environment';
import { AlertService } from '_shared/services';
import { untilDestroyed } from 'ngx-take-until-destroy';

@Component({
  selector: 'app-ad-resource-form',
  templateUrl: './ad-resource-form.component.html',
  styleUrls: ['./ad-resource-form.component.scss'],
})
export class AdResourceFormComponent implements OnInit, OnDestroy {
  adResourceForm: FormGroup;
  showForm = true;
  assetsUrl = environment.assetsUrl;
  buttonText = 'Next';

  @Input() adResource: AdResource = new AdResource();
  @Input() issueId;
  @Output()
  adResourceSaved = new EventEmitter();
  currentUser;

  attachments = [];

  @ViewChild('dialogConfirmAttachmentDelete', {static: false}) dialogConfirmAttachmentDelete;

  constructor(private formBuilder: FormBuilder,
              private authService: AuthService,
              private advertisingService: AdvertisingService,
              private dialog: MatDialog,
              private lightbox: Lightbox,
              private alertService: AlertService) {
  }

  ngOnInit() {
    // If it's new adResource show form
    this.showForm = !this.adResource.id;
    this.currentUser = this.authService.getCurrentUser();
    this.createAdResourceForm();


    if (this.adResource.id) {
      this.getAttachments();
    }
  }

  createAdResourceForm() {
    this.adResourceForm = this.formBuilder.group({
      title: [this.adResource.title, [Validators.required]],
      resource: [this.adResource.title, [Validators.required]],
      // file: [],
    });
    this.buttonText = 'Next';
  }

  getAttachments() {
    this.advertisingService.getAttachmentsFromAdResource(this.adResource.id).subscribe((response: any) => {
      const attachments = [];

      response.data.forEach(item => {
        const attachmentItem = {
          id: item.id,
          src: item.url,
          format: item.format,
          // caption: caption,
          thumb: item.thumbSecureUrl || item.url
        };

        attachments.push(attachmentItem);
      });

      this.attachments = attachments;
    });
  }

  saveAdResource() {
    const adResourceData = Object.assign(new AdResource(), this.adResourceForm.getRawValue());
    if (!adResourceData.title) {
      this.alertService.showAlertDanger('Ad title cannot be empty! No changes were saved!');
    } else if (!adResourceData.resource) {
      this.alertService.showAlertDanger('Ad text cannot be empty! No changes were saved!');
    } else if (this.adResource.id) {
      this.advertisingService.updateAdResource(this.adResource.id, adResourceData).subscribe((response) => {
        this.adResourceForm.reset();
        this.adResource = response;
        this.showForm = false;
      });
    } else {
      this.advertisingService.createAdResource(this.issueId, adResourceData).subscribe((response) => {
        this.adResourceForm.reset();
        this.adResource = response;
        this.showForm = false;
      });
    }
  }

  showEditForm() {
    this.showForm = true;
    this.adResourceForm.setValue({
      title: this.adResource.title,
      resource: this.adResource.resource,
    });
    this.buttonText = 'Save';
  }

  closeForm() {
    this.showForm = false;
    this.adResourceForm.reset();
  }

  inputFileChange($event) {
    // $event.preventDefault();
    const files = $event.target.files;
    this.advertisingService.addAttachmentToAdResource(this.adResource.id, files[0])
      .subscribe((result) => {
        this.getAttachments();
      });
  }

  deleteAttachment(attachmentId, $event) {
    $event.preventDefault();
    $event.stopPropagation();


    this.dialog.open(this.dialogConfirmAttachmentDelete).afterClosed().pipe(untilDestroyed(this)).subscribe(value => {
      this.advertisingService.removeAttachmentFromAdResource(this.adResource.id, attachmentId)
        .subscribe(() => {
          this.getAttachments();
        });
    });
  }

  showAttachment(index) {
    this.lightbox.open(this.attachments, index);
  }

  closePreview(): void {
    // close lightbox programmatically
    this.lightbox.close();
  }

  ngOnDestroy() {}
}
