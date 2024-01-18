import { EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';

export interface Trigger {
  emitter: EventEmitter<string>;
  event: string;
}

export interface TriggerOrCallbackOptions {
  trigger?: Trigger;
  cb?: Function;
  obs?: Observable<any>;
  beforeHandle?: Function;
  cbCancel?: Function;
}
