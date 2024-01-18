import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';

@Injectable()
export class EditFormDeactivateGuardService implements CanDeactivate<any> {

  constructor() { }

  canDeactivate(component): boolean {
    component.resetForm();
    return true;
  }

}

