import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Publication } from '_models/publication.model';
import { ActivatedRoute } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { MatDialog, MatPaginator, MatTableDataSource } from '@angular/material';
import { ActionsService } from 'user-dashboard/shared/services';
import { ConfirmComponent, ShippingAddressFormComponent } from '_shared/components';
import { AlertService } from '_shared/services';
import { ShippingAddressService } from '_services/shipping-address.service';
import { LoadingService } from '_services/loading.service';
import { MatSort } from '@angular/material/sort';
import { lowerCaseDataAccessor } from 'user-dashboard/shared/components';
import { SelectionModel } from '@angular/cdk/collections';
import { forkJoin } from 'rxjs';
import { AddressIssueRelatedComponent } from 'user-dashboard/shipping-address/modals/address-issue-related/address-issue-related.component';

@Component({
  selector: 'app-shipping-address',
  templateUrl: './shipping-address.component.html',
  styleUrls: [
    '../shared/components/table-base/table-base.component.scss',
    './shipping-address.component.scss'
  ],
  host: {
    class: 'd-flex flex-column flex-fill',
  },
})
export class ShippingAddressComponent implements OnInit, OnDestroy {
  publication: Publication;
  addresses;
  dataSource: MatTableDataSource<any>;
  displayedColumns = [
    'select',
    'addressTo',
    // 'lastName',
    'address',
    // 'address2',
    'city',
    'state',
    'zip',
    'phone',
    'actions'
  ];
  loading: boolean;

  selection = new SelectionModel<any>(true, []);

  constructor(private route: ActivatedRoute,
              private actionsService: ActionsService,
              private alertService: AlertService,
              private shippingAddressService: ShippingAddressService,
              private loadingService: LoadingService,
              private dialog: MatDialog) {
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
    this.route.data
      .pipe(untilDestroyed(this))
      .subscribe(data => {
        this.publication = data.publication;
        this.reload();
      });
  }

  onPublicationHeaderEvent(event) {
    if (event === 'reload') {
      this.reload();
    }
  }

  reload() {
    this.loading = true;
    this.shippingAddressService.getPublicationShippingAddresses(this.publication.id).subscribe((addresses) => {
      this.addresses = addresses;
      this.dataSource = new MatTableDataSource(this.addresses);
      this.loading = false;
    });
  }

  addNewAddress() {
    this.actionsService.addNewAddress(this.publication, {
      cb: (result) => {
        if (result) {
          this.alertService.showAlertSuccess('Shipping Address Saved');
          this.reload();
        }
      }
    });
  }

  addMultipleAddress() {
    this.actionsService.addAddressCSV(this.publication, {
      cb: (result) => {
        if (!result) {
          return;
        }
        this.loadingService.showAnimation('Import Address', `Importing ${ result.data.length } addresses!`);
        this.shippingAddressService.createMultipleShippingAddresses(this.publication.id, { addresses: result.data })
          .subscribe(data => {
            this.loadingService.hideAnimation();
            this.reload();
            this.alertService.showAlertSuccess('Address added successful');
          }, () => {
            this.loadingService.hideAnimation();
            this.alertService.showAlertDanger('Something went wrong importing your addresses');
          });
      },
    });
  }

  editShippingAddress(address, $event) {
    $event.preventDefault();
    $event.stopPropagation();
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
        this.reload();
      }
    });
  }

  deleteShippingAddress(addressId, $event) {
    $event.preventDefault();
    $event.stopPropagation();
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
              this.reload();
            });
        }
      });
  }

  ngOnDestroy() {
  }

  bulkDelete() {

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
          forkJoin(this.selection.selected.map(addressId => this.shippingAddressService.deleteShippingAddress(addressId)))
            .subscribe(() => {
              this.alertService.showAlertSuccess('Shipping Address Deleted');
              this.reload();
            });
        }
      });

  }

  isAllSelected() {
    return this.selection.selected.length === this.addresses.length;
  }

  masterToggle() {
    if (this.addresses.length === this.selection.selected.length) {
      this.selection.clear();
    } else {
      this.selection.select(...this.addresses.map(a => a.id));
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  viewIssuesRelated(address, $event) {
    console.log(address);
    this.dialog.open(AddressIssueRelatedComponent, {
      panelClass: ['flat-dialog', 'normal', 'height-1100', 'width-1100', 'mobile-support'],
      data: {
        publicationId: this.publication.id,
        address
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        // this.alertService.showAlertSuccess('Shipping Address Updated');
        // this.reload();
      }
    });
  }
}
