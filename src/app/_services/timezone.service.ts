import { Injectable } from '@angular/core';
import * as momentTimezone from 'moment-timezone';

@Injectable({ providedIn: 'root' })
export class TimezoneService {
  getTimeZone() {
    const timeZone = momentTimezone.tz.guess();
    const abbr = momentTimezone.tz(timeZone).format('Z');
    return abbr.split(':').join('');
  }

  getTimeZoneAbbr() {
    const timeZone = momentTimezone.tz.guess();
    const abbr = momentTimezone.tz(timeZone).format('z');
    const charCode = abbr[2].charCodeAt(0);
    const firstChar = abbr[1].charCodeAt(0) === 49 ? abbr[1] : '';
    if (charCode >= 48 && charCode <= 57) {
      if (abbr.length === 3) {
        return `GMT${abbr[0] + firstChar + abbr[2]}`;
      } else {
        return `GMT${abbr}`;
      }
    } else {
      return abbr;
    }
  }
}
