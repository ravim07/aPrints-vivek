import {
  Pipe,
  PipeTransform
} from '@angular/core';

import * as moment from 'moment';

@Pipe({
  name: 'timeAgo'
})
export class TimeAgoPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    const date = moment(value);
    return date.isValid() ? date.fromNow() : null;
  }

}
