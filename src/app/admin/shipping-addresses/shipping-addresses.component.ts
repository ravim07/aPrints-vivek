import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Publication } from '_models/publication.model';
import { Issue } from '_models/issue.model';
import { ShippingAddressService } from '_services/shipping-address.service';
import { MatDialog, MatPaginator, MatTableDataSource } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { BaseActionsService, IssueService } from '_services';
import { AlertService } from '_shared/services';
import { ConfirmComponent, ShippingAddressFormComponent } from '_shared/components';
import { ActionsService } from 'user-dashboard/shared/services';
import { Address } from '_models';
import { MatSort } from '@angular/material/sort';
import { lowerCaseDataAccessor } from 'user-dashboard/shared/components';

@Component({
  selector: 'admin-shipping-addresses',
  templateUrl: './shipping-addresses.component.html',
  styleUrls: ['./shipping-addresses.component.scss'],
  providers: [BaseActionsService, ActionsService]
})
export class ShippingAddressesComponent implements OnInit {

  @Input() publication: Publication;
  @Input() issue: Issue;
  addresses: Address[];
  dataSource: MatTableDataSource<any>;
  displayedColumns = [
    'select',
    'addressTo',
    'address1',
    'address2',
    'city',
    'state',
    'zip',
    'phone',
    'actions'
  ];
  selectionAddress: SelectionModel<any>;

  constructor(private shippingAddressService: ShippingAddressService,
              private issueService: IssueService,
              private dialog: MatDialog,
              private actionsService: ActionsService,
              private alertService: AlertService) {
  }

  @ViewChild('tableSort', { static: false })
  set sort(value: MatSort) {
    if (this.dataSource) {
      this.dataSource.sortingDataAccessor = lowerCaseDataAccessor;
      this.dataSource.sort = value;
    }
  }

  @ViewChild('paginator', { static: false })
  set paginator(value: MatPaginator) {
    if (this.dataSource) {
      this.dataSource.paginator = value;
    }
  }

  ngOnInit() {
    this.getAddresses();
    if (this.issue.addressIds.length) {
      // this.selectionAddress.select(...this.issue.addressIds);
    }
    this.selectionAddress = new SelectionModel<any>(true, this.issue.addressIds);

  }

  reloadTable() {
    this.getAddresses();
  }

  getAddresses() {
    this.shippingAddressService.getPublicationShippingAddresses(this.publication.id)
      .subscribe(addresses => {
        this.addresses = addresses;
        this.dataSource = new MatTableDataSource(this.addresses);
      });
  }

  downloadAddressesInCSV() {
    const addresses = this.addresses.filter(a => this.selectionAddress.selected.includes(a.id));
    const csvContent = 'data:text/csv;charset=utf-8,' +
      [
        [
          'addressTo',
          'address1',
          'address2',
          'city',
          'state',
          'zip',
          'phone',
        ].join(','),
        ...addresses.map(i => {
          return [
            i.addressTo,
            i.address1,
            i.address2,
            i.city,
            i.state,
            i.zip,
            i.phone,
          ].join(',');
        })
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${ this.publication.name }-${ this.issue.name }-addresses.csv`);
    document.body.appendChild(link);

    link.click();

  }

  masterSelectionToggle() {
    if (this.addresses.length === this.selectionAddress.selected.length) {
      this.selectionAddress.clear();
    } else {
      this.selectionAddress.select(...this.addresses.map(i => i.id));
    }
  }

  save() {
    this.issue.addressIds = this.selectionAddress.selected;
    this.issueService
      .updateIssue(this.issue.id, this.issue)
      .subscribe((result) => {
        this.alertService.showAlertSuccess(
          'Shipping Addresses updated.'
        );
      });
  }

  editShippingAddress(address) {
    this.dialog.open(ShippingAddressFormComponent, {
      panelClass: ['flat-dialog', 'normal', 'height-1100', 'width-700', 'mobile-support'],
      data: {
        publicationId: this.publication.id,
        editMode: true,
        address
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.alertService.showAlertSuccess('Shipping Address Updated');
        this.reloadTable();
      }
    });
  }

  deleteShippingAddress(addressId) {
    const dialogConfig = this.actionsService.setDialogConfig(
      [
        'flat-dialog',
        'confirmation',
        'space-around',
        'height-330',
        'width-700',
      ],
      {
        msg: `Are you sure you want to remove this address?`,
        title: 'Delete Confirmation',
        okBtnTxt: 'Delete',
        cancelBtnTxt: 'Cancel',
        diffCancelCloseValue: true,
      }
    );
    this.dialog.open(ConfirmComponent, dialogConfig)
      .afterClosed()
      .subscribe(result => {
        if (result === true) {
          this.shippingAddressService.deleteShippingAddress(addressId)
            .subscribe(() => {
              this.alertService.showAlertSuccess('Shipping Address Deleted');
              this.reloadTable();
            });
        }
      });
  }

  addShippingAddress() {
    this.actionsService.addNewAddress(this.publication, {
      cb: (result) => {
        if (result) {
          this.getAddresses();
        }
      }
    });
  }

}
