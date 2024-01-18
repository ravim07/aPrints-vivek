import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { IssuePreview } from '_models';
import { Publication } from '_models/publication.model';
import { IssueService } from './issues.service';
import { PublicationService } from './publications.service';

@Injectable({ providedIn: 'root' })
export class SearchService {
  constructor(
    private publicationService: PublicationService,
    private issueService: IssueService
  ) {}

  searchPublication(terms: Observable<string>): Observable<Publication[]> {
    return terms.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((term) => {
        if (term.length > 2) {
          return this.searchEntriesPublication(term);
        }
        return EMPTY;
      })
    );
  }

  searchIssue(terms: Observable<string>): Observable<IssuePreview[]> {
    return terms.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((term) => {
        if (term.length > 2) {
          return this.searchEntriesIssue(term);
        }
        return EMPTY;
      })
    );
  }

  searchEntriesPublication(term) {
    return this.publicationService.searchPublication(term);
  }

  searchEntriesIssue(term) {
    return this.issueService.searchIssue(term);
  }
}
