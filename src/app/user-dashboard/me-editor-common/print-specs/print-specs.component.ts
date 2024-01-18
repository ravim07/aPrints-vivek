import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { IssueBaseComponent } from 'user-dashboard/shared/components';
import {
  IssueResolverService,
  PublicationResolverService,
} from 'user-dashboard/shared/resolvers';
import {
  IssueActionsService,
  SubmissionsActionsService,
} from 'user-dashboard/shared/services';
import { StoreService } from 'user-dashboard/shared/state';
import { canChangePrintSpecs, printingPreferencesOptions } from '_models';
import { PermissionsService } from '_services';

@Component({
  selector: 'app-print-specs',
  templateUrl: './print-specs.component.html',
  styleUrls: [
    '../../shared/components/issue-base/issue-base.component.scss',
    './print-specs.component.scss',
  ],
  host: {
    class: 'd-flex flex-column flex-fill',
  },
  encapsulation: ViewEncapsulation.None,
})
export class PrintSpecsComponent
  extends IssueBaseComponent
  implements OnInit, OnDestroy {
  printPrefsOptions = printingPreferencesOptions;
  printingPrefsForm: FormGroup;
  canChangePrintSpecs: boolean;

  constructor(
    route: ActivatedRoute,
    router: Router,
    publicationResolverService: PublicationResolverService,
    issueResolverService: IssueResolverService,
    private issueActionsService: IssueActionsService,
    submissionsActionsService: SubmissionsActionsService,
    permissionsService: PermissionsService,
    storeService: StoreService
  ) {
    super(
      route,
      router,
      publicationResolverService,
      issueResolverService,
      submissionsActionsService,
      permissionsService,
      storeService
    );
  }

  ngOnInit(): void {
    this.storeService
      .currentPublicationIssue()
      .pipe(untilDestroyed(this))
      .subscribe((data) => {
        this.loadData({
          issue: data.issue,
          publication: data.publication,
        });
        // this.reload();
      });
  }

  loadData({ issue, publication }) {
    this.issue = issue;
    this.draft = this.issue.getCurrentDraft();
    this.publication = publication;
    const hasPrefs = this.issue.printingPreferences;
    this.canChangePrintSpecs = canChangePrintSpecs(this.issue);
    this.printingPrefsForm = new FormGroup({
      trim: new FormControl(
        hasPrefs
          ? this.issue.printingPreferences.trim
          : this.printPrefsOptions.trim[0].id,
        [Validators.required]
      ),
      insidePages: new FormControl(
        hasPrefs
          ? this.issue.printingPreferences.insidePages
          : this.printPrefsOptions.insidePages[6].id,
        [Validators.required]
      ),
      numberOfCopies: new FormControl(
        hasPrefs
          ? this.issue.printingPreferences.getStrNumberOfCopies()
          : this.printPrefsOptions.numberOfCopies[5].id,
        [Validators.required]
      ),
      color: new FormControl(
        hasPrefs
          ? this.issue.printingPreferences.color
          : printingPreferencesOptions.colorMap.get('color'),
        [Validators.required]
      ),
      cover: new FormControl(
        hasPrefs ? this.issue.printingPreferences.cover : 'Same as Inside',
        [Validators.required]
      ),
      binding: new FormControl(
        hasPrefs ? this.issue.printingPreferences.binding : 'Saddle Stitch',
        [Validators.required]
      ),
    });
    console.log(this.issue, this.draft, this.canChangePrintSpecs);
  }

  save() {
    this.issueActionsService.editIssue(
      { id: this.issue.id, printingPreferences: this.printingPrefsForm.value },
      { cb: () => this.reload() }
    );
  }

  cancel() {}
  ngOnDestroy() {}
}
