import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms/';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { LocalDataSource } from 'ng2-smart-table';
import { untilDestroyed } from 'ngx-take-until-destroy';
import {
  asyncForEach,
  asyncForObj,
  cleanupString,
  groupBy,
  removeUnwantedProps,
} from 'utils';
import { PageAdPricing } from '_models';
import { AdvertisingSummary } from '_models/advertising-summary.model';
import { Publication } from '_models/publication.model';
import { AdvertisingService } from '_services';
import { ConfirmComponent } from '_shared/components/confirm/confirm.component';
import { AlertService } from '_shared/services';
import { TableBaseComponent } from '../table-base/table-base.component';

@Component({
  selector: 'app-ad-rate-sheet',
  templateUrl: './ad-rate-sheet.component.html',
  styleUrls: ['./ad-rate-sheet.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AdRateSheetComponent
  extends TableBaseComponent
  implements OnInit, OnDestroy {
  @ViewChild('table', { static: false }) table;
  pageAdPricing: Array<PageAdPricing>;
  columnsForm: FormGroup;
  source: LocalDataSource;
  columnNumber: number;
  zeroArray: Array<number>;
  settings = {
    rowClassFunction: (row) => {
      return 'smart-table-row';
    },
    hideSubHeader: true,
    mode: 'inline',
    attr: {
      class: 'table-default',
      id: 'smart-table',
    },
    actions: {
      position: 'right',
      columnTitle: 'Actions',
    },
    add: {
      inputClass: 'input-default input-font',
      addButtonContent: 'Add Ad Type',
      confirmCreate: true,
    },
    edit: {
      inputClass: 'input-default',
      confirmSave: true,
    },
    delete: {
      confirmDelete: true,
    },
    columns: {},
  };
  defaultData = [
    {
      typeLiteral: 'Back Cover',
      description: '8.5x11 with 0.125 bleed (full color)',
      1: 200,
      2: 370,
      3: 540,
      4: 710,
      5: 880,
      6: 1050,
    },
    {
      typeLiteral: 'Full Page',
      description: '8.5x11 with 0.125 bleed (full color)',
      1: 150,
      2: 275,
      3: 400,
      4: 525,
      5: 650,
      6: 775,
    },
    {
      typeLiteral: 'Half Page',
      description: '4.25x5.5 with 0.125 bleed (full color)',
      1: 90,
      2: 160,
      3: 230,
      4: 300,
      5: 370,
      6: 440,
    },
  ];
  tableBreakPoint = false;
  loading = true;

  constructor(
    public dialogRef: MatDialogRef<AdRateSheetComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      publication: Publication;
    },
    private alertService: AlertService,
    private advertisingService: AdvertisingService,
    public dialog: MatDialog
  ) {
    super();
    this.source = new LocalDataSource(this.defaultData);
    this.pageAdPricing = this.data.publication.pageAdsPricingMatrix;
  }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.initTable();
    this.createForm();
    this.initColumns();
    this.loading = true;
    this.advertisingService
      .getListPageAdPricings(this.data.publication.id)
      .subscribe(async (adData: Array<PageAdPricing>) => {
        this.pageAdPricing = this.data.publication.pageAdsPricingMatrix;
        // console.log(adData, this.data);
        const bySizeType = this.groupByAdTypeLiteral();
        const result = await bySizeType(adData);
        // console.log("TCL: AdvertisingPricingMatrixComponent -> ngOnInit -> result", result);
        const parsedData = await this.parseApiDataToTable(result);
        // console.log("TCL: AdvertisingPricingMatrixComponent -> ngOnInit -> parsedData", parsedData);
        if (parsedData.length > 0) {
          await this.source.load(parsedData);
          this.initColumns(true, Object.keys(parsedData[0]).length - 2);
        }
        this.loading = false;
        // console.log(this.table);
      });
  }

  initColumns(change?: boolean, number?: number) {
    const numberOfColumns =
      number || Object.keys(this.settings.columns).length - 2;
    // console.log("TCL: AdvertisingPricingMatrixComponent -> ngOnInit -> numberOfColumns", numberOfColumns);
    this.columnsForm.controls['numberOfColumns'].setValue(numberOfColumns);
    if (change) {
      this.changeTable();
    }
  }

  private groupByAdTypeLiteral() {
    return groupBy('typeLiteral');
  }

  private async parseApiDataToTable(data: Array<PageAdPricing>) {
    const parsedData = [];
    await asyncForObj(data, async (o) => {
      const obj = {
        typeLiteral: o[0].typeLiteral,
        description: o[0].description,
      };
      await asyncForEach(o, async (i: PageAdPricing) => {
        obj[i.numberOfIssues] = i.amount;
      });
      parsedData.push(obj);
    });
    return parsedData;
  }

  createForm() {
    this.columnsForm = new FormGroup({
      numberOfColumns: new FormControl(null, [
        Validators.required,
        Validators.max(12),
        Validators.pattern(/^-?(0|[1-9]\d*)?$/),
      ]),
    });
  }

  private initTable(empty?: boolean) {
    this.checkDeviceWidth();
    const typeLiteralTitle = 'Type',
      descriptionTitle = 'Desc';
    // if (this.tableBreakPoint) {
    //   typeLiteralTitle = 'Type';
    //   descriptionTitle = 'Desc';
    // }
    if (!empty) {
      /*1 --> , editor: {type: 'custom', component: AdvertisingCustomEditorComponent}*/
      this.settings.columns = {
        typeLiteral: {
          title: typeLiteralTitle,
          filter: false,
          class: 'smart-table-size-column',
          sort: true,
        },
        description: {
          title: descriptionTitle,
          filter: false,
          class: 'smart-table-size-column',
          sort: true,
        },
        1: {
          title: '1 Issue',
          filter: false,
          class: 'smart-table-issue-column',
          sort: false /*1*/,
        },
        2: {
          title: '2 Issues',
          filter: false,
          class: 'smart-table-issue-column',
          sort: false /*1*/,
        },
        3: {
          title: '3 Issues',
          filter: false,
          class: 'smart-table-issue-column',
          sort: false /*1*/,
        },
        4: {
          title: '4 Issues',
          filter: false,
          class: 'smart-table-issue-column',
          sort: false /*1*/,
        },
        5: {
          title: '5 Issues',
          filter: false,
          class: 'smart-table-issue-column',
          sort: false /*1*/,
        },
        6: {
          title: '6 Issues',
          filter: false,
          class: 'smart-table-issue-column',
          sort: false /*1*/,
        },
      };
      this.columnNumber = 6;
    } else {
      this.settings.columns = {
        typeLiteral: {
          title: typeLiteralTitle,
          filter: false,
          class: 'smart-table-size-column',
          sort: true,
        },
        description: {
          title: descriptionTitle,
          filter: false,
          class: 'smart-table-size-column',
          sort: true,
        },
      };
      this.columnNumber = 1;
    }
  }

  private setColumn(number: number) {
    if (!this.settings.columns[number]) {
      this.settings.columns[number] = { filter: false };
      this.settings.columns[number].title = number;
      this.settings.columns[number].class = 'smart-table-issue-column';
      this.settings.columns[number].sort = false;
      // this.settings.columns[number].editor= {
      //   type: 'custom',
      //   component: AdvertisingCustomEditorComponent,
      // };
    }
  }

  changeTable() {
    console.log('changeTable in effect');
    if (this.columnsForm.valid) {
      this.initTable(true);
      this.columnNumber = parseInt(
        this.columnsForm.get('numberOfColumns').value,
        10
      );
      this.zeroArray = new Array(this.columnNumber + 3).fill(0); // console.log(this.zeroArray);
      for (let index = 1; index <= this.columnNumber; index++) {
        this.setColumn(index);
      }
      this.settings = Object.assign({}, this.settings);
    } else {
      this.alertService.showAlertDanger('Invalid number of issues');
    }
  }

  getErrorMessage() {
    if (this.columnsForm.get('numberOfColumns').value > 12) {
      return 'Number of issues cannot be higher than 12';
    } else if (this.columnsForm.get('numberOfColumns').value === 0) {
      return 'Number of issues cannot be zero';
    } else if (!this.columnsForm.get('numberOfColumns').value) {
      return 'Number of issues cannot be empty';
    } else if (isNaN(this.columnsForm.get('numberOfColumns').value)) {
      return 'Number of issues must be a number';
    }
  }

  setDialogConfig(panelClass: string[], data: any): MatDialogConfig {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.panelClass = panelClass;
    dialogConfig.data = data;
    return dialogConfig;
  }

  private async cleanData() {
    const keys = Array(this.columnNumber)
      .fill(0)
      .map((e, i) => i + 1);
    const nIssuesProps = ['typeLiteral', 'description', ...keys].map((i) =>
      i.toString()
    );
    // console.log("TCL: AdvertisingPricingMatrixComponent -> cleanData -> nIssuesProps", nIssuesProps);
    const data = await this.source.getAll();
    const dataToSend = await removeUnwantedProps(data, nIssuesProps);
    // console.log("TCL: AdvertisingPricingMatrixComponent -> cleanData -> dataToSend", dataToSend);
    const preparedData = (await Promise.all(
      dataToSend.map(async (o) => {
        o.typeLiteral = o.typeLiteral;
        o.type = await cleanupString(o.typeLiteral);
        o.description = o.description;
        return o;
      })
    )) as any;
    // console.log("TCL: AdvertisingPricingMatrixComponent -> cleanData -> preparedData", preparedData);
    const parsedData = [];
    await Promise.all(
      preparedData.map(async (o) => {
        await asyncForEach(keys, async (i) => {
          await parsedData.push({
            amount: o[i],
            numberOfIssues: i,
            type: o.type,
            typeLiteral: o.typeLiteral,
            description: o.description,
          });
        });
      })
    );
    return parsedData;
  }

  addSizeType() {
    this.table.grid.createFormShown = true;
  }

  async saveMatrix() {
    const dataToSend = await this.cleanData();
    // console.log("TCL: saveMatrix -> data", dataToSend);
    this.dialogRef.close(dataToSend);
  }

  onDeleteConfirm($event) {
    const dialogConfig = this.setDialogConfig(
      [
        'flat-dialog',
        'confirmation',
        'space-around',
        'height-330',
        'width-700',
      ],
      {
        msg: `You are about to delete this row. Are you sure?`,
        okBtnTxt: 'Confirm',
        cancelBtnTxt: 'Cancel',
      }
    );
    this.dialog
      .open(ConfirmComponent, dialogConfig)
      .afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe((result) => {
        if (result === true) {
          $event.confirm.resolve();
        } else {
          $event.confirm.reject();
        }
      });
  }

  onSaveConfirm($event) {
    // console.log($event.newData);
    // console.log("TCL: onSaveConfirm -> $event.newData", $event.newData);
    const nullValues = this.checkIfNullValues($event.newData);
    const notNumberValues = this.checkIfNumbersOnly($event.newData);
    if (nullValues) {
      $event.confirm.reject();
      this.alertService.showAlertDanger(
        'You must fill all cells. Please check that you dont have empty cells'
      );
      return;
    } else if (notNumberValues) {
      $event.confirm.reject();
      this.alertService.showAlertDanger(
        'Only numbers can be accepted as values. Please check for typos'
      );
      return;
    } else {
      if (window.confirm('Are you sure you want to save?')) {
        // $event.newData['name'] += ' + added in code';
        $event.confirm.resolve($event.newData);
      } else {
        $event.confirm.reject();
      }
    }
  }

  onCreateConfirm($event) {
    // console.log($event.newData);
    const nullValues = this.checkIfNullValues($event.newData);
    const notNumberValues = this.checkIfNumbersOnly($event.newData);
    if (nullValues) {
      $event.confirm.reject();
      this.alertService.showAlertDanger(
        'You must fill all cells. Please check that you dont have empty cells'
      );
      return;
    } else if (notNumberValues) {
      $event.confirm.reject();
      this.alertService.showAlertDanger(
        'Only numbers can be accepted as values. Please check for typos'
      );
      return;
    } else {
      $event.confirm.resolve($event.newData);
    }
  }

  checkIfNullValues(obj: Object) {
    return Object.values(obj).filter((o) => o === '' && !o).length > 0;
  }

  checkIfNumbersOnly(obj: Object) {
    let removedProperties = Object.assign({}, obj);
    removedProperties = this.removeProps(removedProperties);
    return Object.values(removedProperties).filter((o) => isNaN(o)).length > 0;
  }

  removeProps(obj: any) {
    delete obj.description;
    delete obj.typeLiteral;
    return obj;
  }

  checkDeviceWidth() {
    if (window.innerWidth <= 640) {
      this.tableBreakPoint = true;
    } else {
      this.tableBreakPoint = false;
    }
  }

  reload() {
    // this.advertisingResolverService
    //   .resolve2(this.publication.id)
    //   .pipe(untilDestroyed(this))
    //   .subscribe((advertisingSummary: AdvertisingSummary) => {
    //     this.loadData(advertisingSummary);
    //     console.log('Subscriptions reloaded!');
    //   });
  }

  loadData(data: AdvertisingSummary) {
    // this.rateSheet = data.perGroup.map(
    //   (o: AdvertisingSummaryItem) => o.adPricing
    // );
    // console.log(this.rateSheet);
    // this.dataSource = new MatTableDataSource(this.rateSheet);
  }

  addDonationLevel() {
    // this.disableAllEdits();
    // this.adTypeForm.reset();
    // this.adTypeForm.get('active').disable();
    // const adPricing = new PageAdPricing().deserialize({
    //   id: '0',
    //   type: '',
    //   content: '',
    //   amount: 0,
    //   editActive: true,
    // });
    // this.active = true;
    // adPricing.active = true;
    // this.rateSheet.push(adPricing);
    // this.dataSource = new MatTableDataSource(this.rateSheet);
  }

  editDonationLevel(id: string) {
    // console.log(id);
    // this.disableAllEdits();
    // const adPricing = this.adPricing.find((o) => o.id === id);
    // this.adTypeForm.patchValue(adPricing);
    // this.active = adPricing.active;
    // adPricing.editActive = true;
  }

  uniqueNameValidation() {
    // return (
    //   this.adPricing.find(
    //     (o) => o.type === this.adTypeForm.get('type').value
    //   ) === undefined
    // );
  }

  saveDonationLevel(id: string) {
    // console.log(id);
    // if (id === '0') {
    //   if (!this.uniqueNameValidation()) {
    //     this.alertService.showAlertDanger(
    //       'You cannot use the same type for multiple subscription types'
    //     );
    //     this.adTypeForm.get('type').setErrors({ notUnique: true });
    //   } else {
    //     const data = {
    //       type: this.adTypeForm.get('type').value,
    //       content: this.adTypeForm.get('content').value,
    //       amount: parseFloat(this.adTypeForm.get('amount').value),
    //     };
    //     this.fundraisingService
    //       .createDonationlevel(this.publication.id, data)
    //       .subscribe(
    //         () => {
    //           this.adTypeForm.reset();
    //           this.disableAllEdits();
    //           this.alertService.showAlertSuccess('Donation Level created.');
    //           this.reload();
    //         },
    //         (errorData) => {
    //           this.alertService.showAlertDangerApiError(errorData);
    //         }
    //       );
    //   }
    // } else {
    //   const data = {
    //     type: this.adTypeForm.get('type').value,
    //     content: this.adTypeForm.get('content').value,
    //     amount: parseFloat(this.adTypeForm.get('amount').value),
    //     active: this.adTypeForm.get('active').value,
    //   };
    //   this.fundraisingService
    //     .editDonationLevel(this.publication.id, id, data)
    //     .subscribe(
    //       () => {
    //         this.adTypeForm.reset();
    //         this.disableAllEdits();
    //         this.alertService.showAlertSuccess('Donation Level saved.');
    //         this.reload();
    //       },
    //       (errorData) => {
    //         this.alertService.showAlertDangerApiError(errorData);
    //       }
    //     );
    // }
  }

  cancelEdit(id: string) {
    // console.log(id);
    // if (id === '0') {
    //   this.adPricing = this.adPricing.filter((v, i, arr) => v.id !== '0');
    //   this.dataSource = new MatTableDataSource(this.adPricing);
    // } else {
    //   this.adTypeForm.reset();
    //   this.disableAllEdits();
    // }
  }

  deleteDonationLevel(id: string) {
    // console.log(id);
    // this.baseActionsService.confirmAction(
    //   {
    //     msg: 'Are you sure you want to delete this donation level?',
    //     okBtnTxt: 'Confirm delete',
    //     cancelBtnTxt: 'Cancel',
    //   },
    //   {
    //     obs: this.fundraisingService.deleteDonationLevel(
    //       this.publication.id,
    //       id
    //     ),
    //     cb: () => {
    //       this.alertService.showAlertSuccess('Donation Level deleted.');
    //       this.disableAllEdits();
    //       this.reload();
    //     },
    //   }
    // );
  }

  disableAllEdits() {
    // this.rateSheet = this.rateSheet.map((o) => {
    //   o.editActive = false;
    //   return o;
    // });
  }

  onClose(): void {
    this.disableAllEdits();
    this.dialogRef.close();
  }

  ngOnDestroy(): void {}
}
