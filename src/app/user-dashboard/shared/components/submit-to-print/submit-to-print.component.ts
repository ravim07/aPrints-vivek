import { AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { PrintActionsService } from 'user-dashboard/shared/services/print-actions.service';
import { Address, printingPreferencesOptions } from '_models';
import { Issue } from '_models/issue.model';
import { Publication } from '_models/publication.model';
import { StatesService } from '_services';
import { ShippingAddressService } from '_services/shipping-address.service';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { ActionsService } from 'user-dashboard/shared/services';
import { AlertService } from '_shared/services';
import { MatSort } from '@angular/material/sort';
import { lowerCaseDataAccessor } from 'user-dashboard/shared/components';

@Component({
  selector: 'app-submit-to-print',
  templateUrl: './submit-to-print.component.html',
  styles: [
    `
      .loading-container {
        min-height: 250px;
        width: 100%;
        display: block !important;
      }

      .header-table {
        padding-left: 24px;
      }

      .shipping-address-list td {
        height: auto !important;
      }

      .shipping-address-list {
        overflow-y: auto !important;
        max-height: 300px !important;
        padding: 0 !important;
      }

      .mat-dialog-content {
        flex: 1;
        display: block !important;
      }

      .mat-dialog-title {
        margin-bottom: 2rem !important;
      }

      .mat-dialog-actions {
        justify-content: center !important;
      }

      .mat-button {
        font-weight: 600;
      }

      .empty-list {
        margin-top: 4rem;
      }

      .empty-list .description {
        color: #292929;
        opacity: 0.5;
      }

      .save {
        width: 11.875rem;
        max-width: 100%;
        flex: inherit !important;
      }


      app-empty-list-placeholder::ng-deep svg {
        height: 11.75rem;
      }

      .mat-paginator::ng-deep .mat-form-field {
        width: auto !important;
      }
    `
  ]
})
export class SubmitToPrintComponent implements OnInit, AfterViewInit, OnDestroy {
  states: Observable<string>;
  printSpecsStr: string;

  selectionAddress: SelectionModel<any>;
  addressList: Address[];
  publication: Publication;
  addressListDataSource: MatTableDataSource<Address>;
  displayedColumns = [
    'select',
    'addressTo',
    'fullAddress',
  ];
  loading;

  constructor(
    public dialogRef: MatDialogRef<SubmitToPrintComponent>,
    public statesService: StatesService,
    public shippingAddressService: ShippingAddressService,
    private printActionsService: PrintActionsService,
    private actionsService: ActionsService,
    private alertService: AlertService,
    @Inject(MAT_DIALOG_DATA)
    public data: { issue: Issue; publication: Publication }
  ) {
    this.publication = data.publication;
    this.states = this.statesService.getStates();
    const printingPrefs = data.issue.printingPreferences;
    const copyStr = printingPrefs.numberOfCopies === 1 ? 'copy' : 'copies';
    this.printSpecsStr =
      `${ printingPreferencesOptions.trimMap.get(printingPrefs.trim) }, ` +
      `${ printingPreferencesOptions.insidePagesMap.get(
        parseInt(printingPrefs.insidePages.toString(), 10)
      ) } pages, ` +
      `${ printingPreferencesOptions.numberOfCopiesMap.get(
        printingPrefs.numberOfCopies
      ) } ${ copyStr }, ` +
      `Cover ${ printingPreferencesOptions.coverMap.get(
        printingPrefs.cover
      ) }, ` +
      `${ printingPreferencesOptions.bindingMap.get(
        printingPrefs.binding
      ) } Binding`;

  }

  @ViewChild('tableSort', { static: false })
  set sort(value: MatSort) {
    if (this.addressListDataSource) {
      this.addressListDataSource.sortingDataAccessor = lowerCaseDataAccessor;
      this.addressListDataSource.sort = value;
    }
  }

  @ViewChild('paginator', { static: false })
  set paginator(value: MatPaginator) {
    if (this.addressListDataSource) {
      this.addressListDataSource.paginator = value;
    }
  }

  ngOnInit() {
    this.getAddresses(this.publication);
  }

  ngAfterViewInit() {

  }

  getAddresses(publication: Publication) {
    this.loading = true;
    this.shippingAddressService.getPublicationShippingAddresses(publication.id)
      .subscribe((addresses: any[]) => {
        this.loading = false;
        this.addressList = addresses;
        this.initTable(this.addressList);

        this.selectionAddress = new SelectionModel<any>(true, this.data.issue.addressIds);
      });
  }

  initTable(data) {
    this.addressListDataSource = new MatTableDataSource<any>(data);
  }

  masterSelectionToggle() {
    if (this.addressList.length === this.selectionAddress.selected.length) {
      this.selectionAddress.clear();
    } else {
      this.selectionAddress.select(...this.addressList.map(i => i.id));
    }
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  addShippingAddress() {
    this.actionsService.addNewAddress(this.publication, {
      cb: (result) => {
        if (result) {
          this.alertService.showAlertSuccess('Shipping Address Saved');
          this.getAddresses(this.publication);
        }
      }
    });
  }

  save() {
    this.dialogRef.close(this.selectionAddress.selected);
  }

  editPrintingPrefs() {
    this.printActionsService.changePrintPrefs({
      issue: this.data.issue,
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.addressListDataSource.filter = filterValue.trim().toLowerCase();
  }

  ngOnDestroy() {
  }
}
