import { Injectable } from '@angular/core';
import { SharedModule } from '_shared/shared.module';

@Injectable({ providedIn: SharedModule })
export class HelperService {
  last = undefined;

  constructor() {}
  intervals = [];

  delayReport = (delayMs: number) =>
    new Promise((resolve) => {
      this.intervals.push(setTimeout(resolve, delayMs));
    });

  timeout = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  setIntervalAsync = (fn: Function, ms: number) => {
    return fn().then(() => {
      this.intervals.push(setTimeout(() => this.setIntervalAsync(fn, ms), ms));
    });
  };

  knuthShuffle = (arr) => {
    let currentIndex = arr.length,
      temporaryValue,
      randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = arr[currentIndex];
      arr[currentIndex] = arr[randomIndex];
      arr[randomIndex] = temporaryValue;
    }
    return arr;
  };

  clearAllTimeouts() {
    if (typeof this.last === 'undefined') {
      this.last = setTimeout('||void', 0); // Opera || IE other browsers accept "" or "void"
    }
    const mx = setTimeout('||void', 0);
    let lastI;
    for (let i = this.last; i <= mx; i++) {
      clearTimeout(i);
      lastI = i;
    }
    this.last = lastI;
  }

  initLast() {
    this.last = undefined;
  }

  killEmAll() {
    while (this.intervals.length > 0) {
      const id = this.intervals.pop();
      if (id) {
        clearTimeout(id);
      }
    }
  }
}
