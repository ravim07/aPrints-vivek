import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'auth/auth.service';
import { ReplaySubject } from 'rxjs';
import { UserDashboardModule } from 'user-dashboard/user-dashboard.module';
import { AccessRequest, role } from '_models';
import { Publication } from '_models/publication.model';
import {
  IssueService,
  PublicationService,
  RequestAccessService,
} from '_services';

@Injectable({ providedIn: UserDashboardModule })
export class UserPublicationsService {
  private publications = new ReplaySubject<Array<Publication>>();
  private requests = new ReplaySubject<Array<AccessRequest>>();
  private currentPublication: Publication;

  constructor(
    private authService: AuthService,
    private publicationService: PublicationService,
    private issueService: IssueService,
    private router: Router,
    private accessRequestService: RequestAccessService
  ) {
    // TODO: Erase this?
    // this.authService.isAuthenticated().subscribe(auth => {
    //   if (auth) {
    //     this.loadPublications();
    //     this.loadPendingRequests();
    //   } else {
    //     this.publications.next([]);
    //   }
    // });
  }

  public update() {
    this.loadPublications();
    this.loadPendingRequests();
  }

  public getPublicationsLastValue() {
    let lastValue = null;
    this.publications.forEach((value) => {
      lastValue = value;
    });
    return lastValue;
  }

  public getPublications() {
    return this.publications.asObservable();
  }

  public getAccessRequests() {
    return this.requests.asObservable();
  }

  public setCurrentPublication(pub: Publication) {
    this.currentPublication = pub;
  }

  public getCurrentPublication(): Publication {
    return this.currentPublication;
  }

  private loadPublications() {
    this.publicationService.getPublications().subscribe(
      (publications: Publication[]) => {
        if (this.authService.isRole(role.managingEditor)) {
          this.setIssuesNumber(publications);
        }
        this.publications.next(publications);
      },
      (errorData: any) => {
        console.error('Error', errorData);
      }
    );
  }

  private loadPendingRequests() {
    const id = this.authService.getCurrentUser().id;
    this.accessRequestService.getOwnRequests(id).subscribe(
      (requests: AccessRequest[]) => {
        this.requests.next(requests);
      },
      (errorData: any) => {
        console.error('Error', errorData);
      }
    );
  }

  private setIssuesNumber(publications: Publication[]) {
    const updateIssues = new Array();

    publications.forEach((pub) => {
      let index = 1;
      pub.publicationIssues.forEach((issue) => {
        if (issue.number !== index.toString()) {
          issue.number = index.toString();
          updateIssues.push({ id: issue.id, number: index.toString() });
        }
        ++index;
      });
    });

    if (updateIssues.length > 0) {
      this.issueService
        .setIssuesNumbers({ issuesArr: updateIssues })
        .subscribe();
    }
  }
}
