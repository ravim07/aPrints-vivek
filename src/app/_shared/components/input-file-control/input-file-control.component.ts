import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';

@Component({
  selector: 'app-input-file-control',
  templateUrl: './input-file-control.component.html',
  styleUrls: ['./input-file-control.component.scss']
})
export class InputFileControlComponent {

  showLoading = false;

  @ViewChild('inputControl', {static: false}) inputControl;

  @Input() placeholder: string;
  @Input() matIcon?: string;
  @Output() fileChanged = new EventEmitter();

  @Input() set loading(val: boolean) {
    this.showLoading = val;
  }

  constructor() {}

  changeHandler($event) {
    this.fileChanged.emit($event);
  }

  handleClick() {
    if (!this.showLoading) {
      const el: HTMLElement = this.inputControl.nativeElement;
      el.click();
    }
    return;
  }

}
