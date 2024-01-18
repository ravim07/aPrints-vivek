import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { PriceCalculatorService, PricingServiceBody } from '_services';
import { printingPreferencesOptions } from '_models';
import { Subject } from 'rxjs/internal/Subject';

@Component({
  selector: 'app-calculator-old',
  templateUrl: './calculator-old.component.html',
  styleUrls: ['./calculator-old.component.scss']
})
export class CalculatorOldComponent implements OnInit {
  calcForm: FormGroup;
  numberPages = printingPreferencesOptions.insidePages;
  numberOfCopies = printingPreferencesOptions.numberOfCopies;
  colorOpts = printingPreferencesOptions.color;
  showCustomQuote = false;
  pricingBody$ = new Subject<PricingServiceBody>();
  constructor(
    private fb: FormBuilder, private pricingService: PriceCalculatorService) {
      this.colorOpts[0].value = 'Color';
  }

  ngOnInit() {
    this.calcForm = this.fb.group({
      color: 'color', numPages: 32, numCopies: 1000,
      total: new FormControl({ value: 0, disabled: true }),
      perCopy: new FormControl({ value: 0, disabled: true })
    });
    this.pricingService.askPricing(this.pricingBody$).subscribe(data => {
      let result;
      if (data.data.price) {
        result = data.data.price;
        this.calcForm.patchValue({ total: result });
        this.calcForm.patchValue({
          perCopy: (result / parseInt(this.calcForm.value.numCopies, 10)).toFixed(2)
        });
      } else {
        this.showCustomQuote = true;
        this.calcForm.patchValue({ total: '-' });
        this.calcForm.patchValue({ perCopy: '-' });
      }
    });
    this.setPricing();
  }
  setPricing() {
    console.log('Asking for price');
    this.showCustomQuote = false;
    this.pricingBody$.next({
      insidePages: parseInt(this.calcForm.value.numPages, 10),
      numberOfCopies: parseInt(this.calcForm.value.numCopies, 10),
      color: this.calcForm.value.color === 'color' ? true : false
    });
  }
}
