import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncateText' })
export class TruncateTextPipe implements PipeTransform {
  transform(value: string, min: number, max: number, elipses: string = '...'): string {
    const biggestWord = 50;
    const length = this.getRandomArbitrary(min, max);
    if (typeof value === 'undefined') {
      return value;
    }
    if (value.length <= length) {
      return value;
    }
    let truncatedText = value.slice(0, length + biggestWord);
    while (truncatedText.length > length - elipses.length) {
      const lastSpace = truncatedText.lastIndexOf(' ');
      if (lastSpace === -1) {
        break;
      }
      truncatedText = truncatedText.slice(0, lastSpace).replace(/[!,.?;:]$/, '');
    }
    return truncatedText + elipses;
  }

  getRandomArbitrary(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
