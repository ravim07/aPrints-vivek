import { Component, Input } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-ctrl-multiple-date-picker',
  templateUrl: './multiple-date-picker.component.html',
  styleUrls: ['./multiple-date-picker.scss']
})
export class MultipleDatePickerComponent {
  @Input() noLabel = false;
  @Input() listDates: Array<any>;
  @Input() showErrorRequired: boolean;
  minDate = new Date();
  assetsUrl = environment.assetsUrl;

  constructor() {
    this.minDate.setDate(this.minDate.getDate() + 1);
  }

  deleteDate(index: number): void {
    this.listDates.splice(index, 1);
  }

  addDate(type: string, event: MatDatepickerInputEvent<Date>): void {
    this.listDates.push(event.value);
  }

}
