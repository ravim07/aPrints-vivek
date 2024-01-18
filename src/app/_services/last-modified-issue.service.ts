import { Injectable, OnDestroy } from '@angular/core';
import { PublicationService } from '.';
import { AuthService } from 'auth/auth.service';
import { role } from '_models';
import { ReplaySubject } from 'rxjs';
import { Publication } from '_models/publication.model';
import { Issue } from '_models/issue.model';

@Injectable({
  providedIn: 'root'
})
export class LastModifiedIssueService {
  lastStatusAsManager = new ReplaySubject<Object>();
  lastStatusAsEditor = new ReplaySubject<Object>();
  lastStatusAsContributor = new ReplaySubject<Object>();
  lastStatusAsAdvertiser = new ReplaySubject<Object>();
  isManager = new ReplaySubject<boolean>();
  isEditor = new ReplaySubject<boolean>();
  isContributor = new ReplaySubject<boolean>();
  isAdvertiser = new ReplaySubject<boolean>();
  publications: Publication[];
  issues: Issue[];

  constructor(
    private authService: AuthService,
    private publicationService: PublicationService
  ) {}

  init() {
    if (this.authService.getCurrentUser()) {
      this.getStatusArrayFromPublicationPerRole();
    }
  }

  private getStatusArrayFromPublicationPerRole() {
    this.publicationService.getPublications().subscribe(
      data => {
        this.publications = data.reverse();
        let statusArrayM = [];
        let statusArrayE = [];
        let statusArrayC = [];
        let issuesArray = [];
        data.map(pub => {
          issuesArray = issuesArray.concat(...pub.publicationIssues);
          switch (pub.role) {
            case role.managingEditor:
              const statusArrayPubM = pub.publicationIssues.reduce((total, issue) => {
                return total.concat(...issue.publicationIssueStatusTracking);
              }, []);
              statusArrayM = statusArrayM.concat(...statusArrayPubM);
            break;
            case role.editorialStaff:
              const statusArrayPubE = pub.publicationIssues.reduce((total, issue) => {
                return total.concat(...issue.publicationIssueStatusTracking);
              }, []);
              statusArrayE = statusArrayE.concat(...statusArrayPubE);
          break;
            case role.contributor:
              const statusArrayPubC = pub.publicationIssues.reduce((total, issue) => {
                return total.concat(...issue.publicationIssueStatusTracking);
              }, []);
              statusArrayC = statusArrayC.concat(...statusArrayPubC);
          break;
          case role.advertiser:
              const statusArrayPubA = pub.publicationIssues.reduce((total, issue) => {
                return total.concat(...issue.publicationIssueStatusTracking);
              }, []);
              statusArrayC = statusArrayC.concat(...statusArrayPubA);
          break;
          }
        });
        this.issues = issuesArray.reverse();
        this.getLastStatusPerRole(statusArrayM, role.managingEditor);
        this.getLastStatusPerRole(statusArrayE, role.editorialStaff);
        this.getLastStatusPerRole(statusArrayC, role.contributor);
        this.getLastStatusPerRole(statusArrayC, role.advertiser);
      }
    );
  }

  private async getLastStatusPerRole(statusArr, roleName) {
    if (statusArr.length > 0) {
      const status = statusArr.reduce(this.compareMaxProp('date'));
      const issue = this.issues.find(o => o.id === status.publicationIssueId);
      this.getIdsAnReturn(issue.publicationId, status.publicationIssueId, roleName);
    } else {
      const pub = await this.publications.find(p => p.role === roleName);
      if (pub) {
        if (pub.publicationIssues.length) {
          const issue = await pub.publicationIssues[pub.publicationIssues.length - 1];
          this.getIdsAnReturn(pub.id, issue.id, roleName);
        }
      }
    }
  }

  private getIdsAnReturn(pubId, issueId, roleName) {
    switch (roleName) {
      case role.managingEditor:
        this.isManager.next(true);
        this.lastStatusAsManager.next({
          issueId: issueId,
          publicationId: pubId
        });
        break;
      case role.editorialStaff:
        this.isEditor.next(true);
        this.lastStatusAsEditor.next({
          issueId: issueId,
          publicationId: pubId
        });
        break;
      case role.contributor:
        this.isContributor.next(true);
        this.lastStatusAsContributor.next({
          issueId: issueId,
          publicationId: pubId
        });
        break;
      case role.advertiser:
        this.isAdvertiser.next(true);
        this.lastStatusAsAdvertiser.next({
          issueId: issueId,
          publicationId: pubId
        });
        break;
    }
  }

  private compareMaxProp(prop) {
    const compareFunc = (max, current) => {
      return (max[prop] > current[prop]) ? max : current;
    };
    return compareFunc;
  }
}
