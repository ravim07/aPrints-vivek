import {
  Pipe,
  PipeTransform
} from '@angular/core';

import * as momentTimezone from 'moment-timezone';

@Pipe({
  name: 'timezoneAbbr'
})
export class TzTagPipe implements PipeTransform {

  transform(value: any, args?: any) {
    const timeZone = momentTimezone.tz.guess();
    const time = new Date();
    const timeZoneOffset = time.getTimezoneOffset();
    const abbr = momentTimezone.tz.zone(timeZone).abbr(timeZoneOffset);
    const charCode = abbr[abbr.length - 1].charCodeAt(0);
    if (charCode >= 48 && charCode <= 57) {
      return `GMT${abbr}`;
    } else {
      return abbr;
    }
  }
}
