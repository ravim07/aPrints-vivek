import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/internal/Subject';
import { PriceCalculatorService, PricingServiceBody } from '_services';

@Component({
  selector: 'app-price-calculator',
  templateUrl: './price-calculator.component.html',
  styleUrls: ['./price-calculator.component.scss'],
})
export class PriceCalculatorComponent implements OnInit {
  _zipCode = '';
  _numberOfCopies;
  _insidePages;
  _color;
  prices = {
    print: null,
    shipping: null,
    tax: null,
    total: null,
  };
  formShippingError = false;
  showQuoteMessage = false;
  showShipping = 'average';
  formShipping = {
    zip: '',
  };
  pricingBody$ = new Subject<PricingServiceBody>();

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
          this.setViewShippingForm();
        } else {
          this.showQuoteMessage = true;
          this.resetPrices();
        }
      },
      (err) => {
        this.resetPrices();
        this.setViewShippingForm();
      }
    );
    this.setPrice();
  }

  @Input()
  set numberOfCopies(val: string) {
    this._numberOfCopies = val;
    this.setPrice();
  }

  @Input()
  set insidePages(val: string) {
    this._insidePages = val;
    this.setPrice();
  }

  @Input()
  set zipCode(val: string) {
    if (this.validateZipCode(val)) {
      this._zipCode = val;
      this.setPrice();
    }
  }

  @Input()
  set color(val: string) {
    this._color = val;
    this.setPrice();
  }

  editShipping() {
    this.showShipping = 'edit-zip';
  }

  saveShippingForm() {
    this.formShippingError = false;
    if (!this.validateZipCode(this.formShipping.zip)) {
      this.formShippingError = true;
    } else {
      this.formShippingError = false;
      this._zipCode = this.formShipping.zip;
      this.setPrice();
    }
  }

  setViewShippingForm() {
    this.formShippingError = false;
    if (!this.formShippingError && this._zipCode) {
      this.showShipping = 'shipping-zip';
    } else {
      this.showShipping = 'average';
    }
  }

  goToGetQuote() {
    this.router.navigateByUrl('/quote');
  }

  onKeydownZip($event) {
    $event.preventDefault();
    this.saveShippingForm();
  }

  private setPrice() {
    this.showQuoteMessage = false;
    if (this._color && this._numberOfCopies && this._insidePages) {
      const data = {
        numberOfCopies: parseInt(this._numberOfCopies, 10),
        insidePages: parseInt(this._insidePages, 10),
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
      this.setViewShippingForm();
    }
  }

  private resetPrices() {
    this.prices.print = null;
    this.prices.shipping = null;
    this.prices.tax = null;
    this.prices.total = null;
  }

  private validateZipCode(zip: string) {
    if (zip && zip.toString().match(/^[0-9]{5}(?:-[0-9]{4})?$/)) {
      return true;
    }
    return false;
  }
}
