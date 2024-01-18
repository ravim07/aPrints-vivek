import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Publication } from '_models/publication.model';

@Injectable({ providedIn: 'root' })
export class RememberPublicationService {
  public publicationSubject: BehaviorSubject<Publication> = new BehaviorSubject<
    Publication
  >(null);

  constructor() {}

  updatePublication(publication: Publication) {
    this.publicationSubject.next(publication);
  }
}
