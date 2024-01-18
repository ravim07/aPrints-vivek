import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { UserDashboardModule } from 'user-dashboard/user-dashboard.module';
import { Issue } from '_models/issue.model';
import { Publication } from '_models/publication.model';

@Injectable({ providedIn: UserDashboardModule })
export class PublicationUpdateService {
  private publicationSource = new Subject<Publication>();
  currentPublication = this.publicationSource.asObservable();

  private issueSource = new Subject<Issue>();
  currentIssue = this.publicationSource.asObservable();

  constructor() {}

  setPublication(pub: Publication) {
    this.publicationSource.next(pub);
  }

  setIssue(issue: Issue) {
    this.issueSource.next(issue);
  }
}
