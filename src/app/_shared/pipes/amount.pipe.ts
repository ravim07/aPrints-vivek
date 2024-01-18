import {
  Pipe,
  PipeTransform
} from '@angular/core';

@Pipe({
  name: 'amount'
})
export class AmountPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (value % 1 !== 0) {
      return value.toFixed(2);
    }
    return value;
  }

}
