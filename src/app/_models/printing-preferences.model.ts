import { Deserializable } from './deserializable.model';

export class PrintingPreferences implements Deserializable {
  trim: string;
  color: string;
  cover: string;
  insidePages: number;
  numberOfCopies: number;
  binding: string;

  deserialize(input: any) {
    if (input && input.numberOfCopies === 0) {
      input.numberOfCopies = null;
    }

    Object.assign(this, input);
    return this;
  }

  getStrNumberOfCopies() {
    if (!this.numberOfCopies) {
      return '';
    }
    return this.numberOfCopies.toString();
  }
}
