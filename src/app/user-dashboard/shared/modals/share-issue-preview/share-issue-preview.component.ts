import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { copyToClipboard } from 'user-dashboard/shared/services/utils';
import { environment } from '../../../../../environments/environment';
import { AlertService } from '_shared/services';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Issue } from '_models/issue.model';
import { Publication } from '_models/publication.model';

@Component({
  selector: 'app-share-issue-preview',
  templateUrl: './share-issue-preview.component.html',
  styleUrls: ['./share-issue-preview.component.scss']
})
export class ShareIssuePreviewComponent implements OnInit {
  issue: Issue;
  publication: Publication;
  previewUrl: string;

  constructor(private dialogRef: MatDialogRef<ShareIssuePreviewComponent>,
              private alertService: AlertService,
              @Inject(MAT_DIALOG_DATA) private data,) {
  }

  ngOnInit() {
    this.issue = this.data.issue;
    this.publication = this.data.publication;
    this.previewUrl = environment.frontBaseUrl + `/p/${this.publication.id}/i/${this.issue.id}`;
  }

  copyUrl() {
    copyToClipboard(
      this.previewUrl
    );
    this.alertService.showAlertSuccess('Link copied to clipboard.');

    this.dialogRef.close();
  }

}
