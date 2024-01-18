import { Deserializable } from '_models/deserializable.model';

export class Review implements Deserializable {
  id: number;
  fullname = '';
  organization = '';
  comment: string;
  commentTemplate: string;
  padding: number;
  position = '';
  profession = '';
  location = '';
  description = '';

  deserialize(input: any) {
    let calc;
    delete input.addedDate;
    delete input.addedBy;
    Object.assign(this, input);
    const length = this.comment.length;
    // console.log(length);
    if (length < 280) { calc = length / 4; } else {
      calc = length / 24;
    }
    const offset = calc < 16  ? 0 : 6;
    this.padding = calc - offset;
    this.commentTemplate = this.comment;
    this.comment = this.comment.replace('<strong>', '').replace('</strong>', '');
    return this;
  }
}
