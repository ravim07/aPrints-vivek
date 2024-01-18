import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/internal/Subject';
import { printingPreferencesOptions } from '_models';
import { PriceCalculatorService, PricingServiceBody } from '_services';

@Component({
  selector: 'app-price-calculator-new',
  templateUrl: './price-calculator-new.component.html',
  styleUrls: ['./price-calculator-new.component.scss'],
})
export class PriceCalculatorNewComponent implements OnInit {
  _zipCode = '';
  _numberOfCopies: number;
  _insidePages: number;
  _color: string;
  numberOfCopiesString: number;
  insidePagesString: number;
  colorString: string;
  trimString: string;
  coverString: string;
  bindingString: string;

  prices = {
    print: null,
    shipping: null,
    tax: null,
    total: null,
  };
  showQuoteMessage = false;
  pricingBody$ = new Subject<PricingServiceBody>();
  printPrefsOptions = printingPreferencesOptions;

  constructor(
    private priceCalculatorService: PriceCalculatorService,
    private router: Router
  ) {}

  ngOnInit() {
    this.priceCalculatorService.askPricing(this.pricingBody$).subscribe(
      (ret) => {
        if (ret.data.price) {
          this.prices.print = ret.data.price;
          this.prices.shipping = ret.data.shipping;
          this.prices.tax = ret.data.tax;
          this.prices.total = ret.data.price + ret.data.shipping + ret.data.tax;
        } else {
          this.showQuoteMessage = true;
          this.resetPrices();
        }
      },
      (err) => {
        this.resetPrices();
      }
    );
    this.setPrice();
  }

  @Input()
  set trim(val: string) {
    this.trimString = printingPreferencesOptions.trimMap.get(val);
    this.setPrice();
  }

  @Input()
  set cover(val: string) {
    this.coverString = printingPreferencesOptions.coverMap
      .get(val)
      .toLowerCase();
    this.setPrice();
  }

  @Input()
  set binding(val: string) {
    this.bindingString = printingPreferencesOptions.bindingMap.get(val);
    this.setPrice();
  }

  @Input()
  set numberOfCopies(val: string) {
  /*  this.numberOfCopiesString = printingPreferencesOptions.numberOfCopiesMap.get(
      parseInt(val, 10)
    );*/
    this.numberOfCopiesString = parseInt(val, 10);
    this._numberOfCopies = parseInt(val, 10);
    this.setPrice();
  }

  @Input()
  set insidePages(val: string) {
    this.insidePagesString = printingPreferencesOptions.insidePagesMap.get(
      parseInt(val, 10)
    );
    this._insidePages = parseInt(val, 10);
    this.setPrice();
  }

  @Input()
  set color(val: string) {
    this.colorString = printingPreferencesOptions.colorMap.get(val);
    this._color = val;
    this.setPrice();
  }

  goToGetQuote() {
    this.router.navigateByUrl('/quote');
  }

  onKeydownZip($event) {
    $event.preventDefault();
  }

  private setPrice() {
    this.showQuoteMessage = false;
    if (this._color && this._numberOfCopies && this._insidePages) {
      const data = {
        numberOfCopies: this._numberOfCopies,
        insidePages: this._insidePages,
        color:
          this._color === 'Full Color' || this._color === 'color'
            ? true
            : false,
      };
      if (this._zipCode) {
        data['zip'] = this._zipCode;
      }
      this.pricingBody$.next(data);
    } else {
      this.resetPrices();
    }
  }

  private resetPrices() {
    this.prices.print = null;
    this.prices.shipping = null;
    this.prices.tax = null;
    this.prices.total = null;
  }
}
