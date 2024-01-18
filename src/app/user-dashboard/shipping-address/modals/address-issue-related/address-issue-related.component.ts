import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Issue } from '_models/issue.model';
import { IssueService } from '_services';
import { ShippingAddressService } from '_services/shipping-address.service';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Address } from '_models';
import { Publication } from '_models/publication.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-address-issue-related',
  templateUrl: './address-issue-related.component.html',
  styleUrls: ['./address-issue-related.component.scss']
})
export class AddressIssueRelatedComponent implements OnInit {
  displayedColumns: string[] = [
    'cover',
    'name',
    'createdAt',
    'status',
    'actions',
  ];
  issues: Issue[] = [];
  dataSource: MatTableDataSource<Issue>;
  address: Address;
  publication: Publication;

  constructor(private dialogRef: MatDialogRef<any>, private issueService: IssueService,
              private shippingAddressService: ShippingAddressService,
              private router: Router,
              @Inject(MAT_DIALOG_DATA) private data) {
  }

  ngOnInit() {
    this.address = this.data.address;
    this.publication = this.data.publication;
    this.getIssuesRelated();
  }

  closeModal() {
    this.dialogRef.close();
  }

  getIssuesRelated() {
    this.shippingAddressService.issuesRelatedToAddress(this.address.id).subscribe((issues: Issue[]) => {
      console.log(issues);
      this.issues = issues;
      this.dataSource = new MatTableDataSource<Issue>(issues);
    });
  }

  viewIssue(address) {
    this.router.navigate(['/dashboard', 'publication', address.publicationId, 'issues', address.id])
      .then(() => this.dialogRef.close());

  }

}
