import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Issue } from '_models/issue.model';
import { printingPreferencesOptions } from '_models';
import { IssueService } from '_services';
import { AlertService } from '_shared/services';

@Component({
  selector: 'admin-printing-specs-form',
  templateUrl: './printing-specs-form.component.html',
  styleUrls: ['./printing-specs-form.component.scss']
})
export class PrintingSpecsFormComponent implements OnInit {
  printPrefsOptions = printingPreferencesOptions;
  printingPrefsForm: FormGroup;

  @Input() issue: Issue;

  constructor(private formBuilder: FormBuilder, private issueService: IssueService, private alertService: AlertService) {
  }

  ngOnInit() {
    const printingPreferences = this.issue.printingPreferences;

    this.printingPrefsForm = this.formBuilder.group({
      trim: [printingPreferences.trim, [Validators.required]],
      insidePages: [printingPreferences.insidePages, [Validators.required]],
      numberOfCopies: [printingPreferences.getStrNumberOfCopies(), [Validators.required]],
      color: [printingPreferences.color, [Validators.required]],
      cover: [printingPreferences.cover, [Validators.required]],
      binding: [printingPreferences.binding, [Validators.required]],
    });

  }

  save() {
    if (this.printingPrefsForm.valid) {
      const printingPreferences = this.printingPrefsForm.getRawValue();
      this.issue.printingPreferences = printingPreferences;
      this.issueService
        .updateIssue(this.issue.id, this.issue)
        .subscribe((result) => {
          this.alertService.showAlertSuccess(
            'Printing Specs updated.'
          );
        });
    }
  }

}
