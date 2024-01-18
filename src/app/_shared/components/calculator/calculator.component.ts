import { Component, EventEmitter, OnInit, Output, ViewEncapsulation, } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs/internal/Subject';
import { printingPreferencesOptions } from '_models';
import { PriceCalculatorService, PricingServiceBody } from '_services';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CalculatorComponent implements OnInit {
  calcForm: FormGroup;
  numberPages = printingPreferencesOptions.insidePages;
  numberOfCopies = printingPreferencesOptions.numberOfCopies;
  colorOpts = printingPreferencesOptions.color;
  showCustomQuote = false;
  pricingBody$ = new Subject<PricingServiceBody>();

  @Output() form?: EventEmitter<FormGroup> = new EventEmitter();
  @Output() requestCustomQuote?: EventEmitter<any> = new EventEmitter();
  total: number;
  perCopy: number;

  constructor(
    private fb: FormBuilder,
    private pricingService: PriceCalculatorService
  ) {
    this.colorOpts[0].value = 'Color';
  }

  ngOnInit() {
    this.calcForm = this.fb.group({
      color: 'color',
      numPages: 32,
      numCopies: 1000,
      // total: new FormControl({ value: 0, disabled: true }),
      // perCopy: new FormControl({ value: 0, disabled: true }),
    });
    this.pricingService.askPricing(this.pricingBody$).subscribe((data) => {
      let result;
      if (data.data.price) {

        result = data.data.price;
        this.total = result;
        this.perCopy = parseFloat((result / parseInt(this.calcForm.value.numCopies, 10)).toFixed(2));
        this.showCustomQuote = false;
      } else {
        this.showCustomQuote = true;
        this.perCopy = undefined;
        this.total = undefined;
      }
    });
    this.setPricing();
  }

  setPricing() {
    this.showCustomQuote = false;
    this.pricingBody$.next({
      insidePages: parseInt(this.calcForm.value.numPages, 10),
      numberOfCopies: parseInt(this.calcForm.value.numCopies, 10),
      color: this.calcForm.value.color === 'color' ? true : false,
    });
    this.form.emit(this.calcForm);
  }

  check(e) {
    console.log(e);
  }

  customQuote() {
    this.requestCustomQuote.emit();
  }
}
