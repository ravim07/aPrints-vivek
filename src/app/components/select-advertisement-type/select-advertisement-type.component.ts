import { Component, EventEmitter, Inject, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PageAdPricing } from '_models';
import { distinctUntilChanged } from 'rxjs/operators';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { asyncForEach, asyncForObj, cleanupString, groupBy } from 'utils';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-select-advertisement-type',
  templateUrl: './select-advertisement-type.component.html',
  styleUrls: ['./select-advertisement-type.component.scss']
})
export class SelectAdvertisementTypeComponent implements OnInit, OnDestroy {
  adTypeForm: FormGroup;
  selectedPageAdPricing: PageAdPricing;
  selectedAdType: string;
  selectedNumberOfIssues: number;
  pageAdsPricing;
  adTypes: { value: string; literal: string }[] = [];

  tableData: any[];
  columns: string[];
  numberOfIssues: number[];
  headerColumnSpan: number;
  @Output() select: EventEmitter<any> = new EventEmitter<any>();

  constructor(public dialogRef: MatDialogRef<SelectAdvertisementTypeComponent>,
              @Inject(MAT_DIALOG_DATA) public data) {
  }

  onCancelClick() {
    this.dialogRef.close();
  }

  selectAdPricing(pricing) {
    this.dialogRef.close(pricing);
  }

  async ngOnInit() {
    this.pageAdsPricing = this.data.pageAdsPricing;
    this.createForm();
    this.setSelectData(this.pageAdsPricing);
    await this.parseApiDataToTable(this.pageAdsPricing);
    this.setSelectChangeDetectors();
  }

  parseInt(input: string): number {
    return parseInt(input, 10);
  }

  ngOnDestroy() {
  }

  private createForm() {
    this.adTypeForm = new FormGroup({
      adType: new FormControl(null, [Validators.required]),
      numberOfIssues: new FormControl(null, [Validators.required]),
    });
  }

  private async selectPricingAd() {
    if (this.selectedAdType && this.selectedNumberOfIssues) {
      // console.log(this.selectedAdType, this.selectedNumberOfIssues);
      this.selectedPageAdPricing = await this.pageAdsPricing.filter(
        (o) =>
          o.numberOfIssues === this.selectedNumberOfIssues &&
          o.type === this.selectedAdType
      )[0];
      // console.log(this.selectedPageAdPricing);
    }
  }

  private async setSelectData(data: PageAdPricing[]) {
    const bySizeType = this.groupBy('typeLiteral');
    const groupResult = await bySizeType(data);
    const adTypes = Object.keys(groupResult);
    // console.log(adTypes);
    adTypes.map(async (o) => {
      const value = await cleanupString(o);
      this.adTypes.push({ value: value, literal: o });
    });
    // console.log(this.adTypes);
    if (groupResult && adTypes.length > 0) {
      this.numberOfIssues = Object.keys(groupResult[adTypes[0]]).map(
        (o) => parseInt(o, 10) + 1
      );
    }
    // console.log(this.numberOfIssues);
  }

  private setSelectChangeDetectors() {
    this.adTypeForm
      .get('adType')
      .valueChanges.pipe(distinctUntilChanged())
      .pipe(untilDestroyed(this))
      .subscribe(async (value) => {
        this.selectedAdType = value;
        this.selectPricingAd();
      });
    this.adTypeForm
      .get('numberOfIssues')
      .valueChanges.pipe(distinctUntilChanged())
      .pipe(untilDestroyed(this))
      .subscribe(async (value) => {
        this.selectedNumberOfIssues = parseInt(value, 10);
        this.selectPricingAd();
      });
  }

  private initTableHeaders() {
    if (this.tableData[0]) {
      let headersToAdd: any = this.tableData[0];
      headersToAdd = Object.keys(headersToAdd);
      headersToAdd = headersToAdd.map((o) => parseInt(o, 10));
      headersToAdd = headersToAdd.filter((o) => !Number.isNaN(o));
      this.headerColumnSpan = headersToAdd.length;
      // console.log(headersToAdd);
      this.columns = [...headersToAdd]; // console.log(this.columns);
    }
  }

  private async parseApiDataToTable(inData: Array<PageAdPricing>) {
    this.tableData = [];
    const bySizeType = this.groupBy('typeLiteral');
    const data = await bySizeType(inData);
    await asyncForObj(data, async (o) => {
      const obj = {
        typeLiteral: o[0].typeLiteral,
        description: o[0].description,
      };
      await asyncForEach(o, async (i: PageAdPricing) => {
        obj[i.numberOfIssues] = await i.amount;
      });
      this.tableData.push(obj);
    });
    // console.log(this.tableData);
    this.initTableHeaders();
  }

  private groupBy(prop: string) {
    return groupBy(prop);
  }
}
