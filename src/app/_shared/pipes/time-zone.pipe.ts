import {
  Pipe,
  PipeTransform
} from '@angular/core';

@Pipe({
  name: 'timeZone'
})
export class TimeZonePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return new Date().getTimezoneOffset() / 60;
  }

}
