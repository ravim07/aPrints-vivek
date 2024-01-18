import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'auth/auth.service';
import { BehaviorSubject, forkJoin, Observable, of, zip } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { UserDashboardModule } from 'user-dashboard/user-dashboard.module';
import { permission, PublicationListItem, PublicationListItemPerms, role, } from '_models';
import { Contribution } from '_models/contribution.model';
import { Issue } from '_models/issue.model';
import { Publication } from '_models/publication.model';
import { IssueService, PublicationService, RequestAccessService, } from '_services';
import { ContributionService } from '../services';
import { AdResource } from '_models/ad-resource.model';
import { AdvertisementService } from 'user-dashboard/shared/services/advertisement.service';

@Injectable({
  providedIn: UserDashboardModule,
})
export class StoreService {
  advertisement: BehaviorSubject<AdResource> = new BehaviorSubject<AdResource>(new AdResource());
  currentAdvertisement: Observable<AdResource> = this.advertisement.asObservable();
  private publicationList: BehaviorSubject<PublicationListItem[]> = new BehaviorSubject([]);
  currentPublicationList: Observable<PublicationListItem[]> = this.publicationList.asObservable();
  private issueList: BehaviorSubject<Issue[]> = new BehaviorSubject([]);
  currentIssueList: Observable<Issue[]> = this.issueList.asObservable();
  private articleList: BehaviorSubject<Contribution[]> = new BehaviorSubject(
    []
  );
  currentArticleList: Observable<Contribution[]> = this.articleList.asObservable();
  private accessRequestList: BehaviorSubject<PublicationListItem[]> = new BehaviorSubject([]);
  currentAccessRequestList: Observable<PublicationListItem[]> = this.accessRequestList.asObservable();
  private publication: BehaviorSubject<Publication> = new BehaviorSubject(
    new Publication()
  );
  currentPublication: Observable<Publication> = this.publication.asObservable();
  private issue: BehaviorSubject<Issue> = new BehaviorSubject(new Issue());
  currentIssue: Observable<Issue> = this.issue.asObservable();
  private article: BehaviorSubject<Contribution> = new BehaviorSubject(
    new Contribution()
  );
  currentArticle: Observable<Contribution> = this.article.asObservable();
  private advertisementList: BehaviorSubject<AdResource[]> = new BehaviorSubject(
    []
  );
  currentAdvertisementList: Observable<AdResource[]> = this.advertisementList.asObservable();

  constructor(
    private router: Router,
    private publicationService: PublicationService,
    private issueService: IssueService,
    private contributionService: ContributionService,
    private advertisementService: AdvertisementService,
    private accessRequestService: RequestAccessService,
    private authService: AuthService
  ) {
  }

  updatePublicationList(list: PublicationListItem[]): void {
    this.publicationList.next(list);
  }

  updateIssueList(list: Issue[]): void {
    this.issueList.next(list);
  }

  updateArticleList(list: Contribution[]): void {
    this.articleList.next(list);
  }

  updateAdvertisementList(list: AdResource[]): void {
    this.advertisementList.next(list);
  }

  updateAccessRequestList(list: PublicationListItem[]): void {
    this.accessRequestList.next(list);
  }

  updatePublication(value: Publication): void {
    this.publication.next(value);
  }

  updateIssue(value: Issue): void {
    this.issue.next(value);
  }

  updateArticle(value: Contribution): void {
    this.article.next(value);
  }

  updateAdvertisement(value: AdResource): void {
    this.advertisement.next(value);
  }

  refreshPublicationList(): Observable<PublicationListItem[]> {
    return this.publicationService.getPublications().pipe(
      map((o) => {
        return o.map((item) => {
          return new PublicationListItem().deserialize({
            publication: item,
            id: item.id,
            cover: item.cover,
            name: item.name,
            description: item.description,
            show: this.checkPermission(item),
            numIssues: item.publicationIssues.length,
            members: item.members,
            totalFunds:
              (item.availableFunds && item.availableFunds.totalAvailable) || 0,
          });
        });
      }),
      tap((list) => {
        this.updatePublicationList(list);
      }),
      catchError(() => {
        return of(null);
      })
    );
  }

  refreshSubmissionList(issueId: string): Observable<Contribution[]> {
    return this.contributionService.getMyOwnContributions(issueId).pipe(
      tap((list) => {
        this.updateArticleList(list);
      }),
      catchError(() => {
        return of(null);
      })
    );
  }

  refreshAdvertisementList(issueId: string): Observable<AdResource[]> {
    return this.advertisementService.getMyOwnAdvertisements(issueId)
      .pipe(
        tap((list) => {
          this.updateAdvertisementList(list);
        }),
        catchError(() => {
          return of(null);
        })
      );
  }

  refreshPublication(pubId: string): Observable<Publication> {
    return forkJoin([
      this.publicationService.getPublication(pubId),
      this.publicationService.getIssuesRelated(pubId)
    ]).pipe(
      map(
        ([publication, publicationIssues]) => {
          return new Publication().deserialize({
            ...publication,
            _publicationIssues: publicationIssues
          });
        }
      ),
      tap((publication) => {
        this.updatePublication(publication);
        this.updateIssueList(publication.publicationIssues);
      }),
      catchError(() => {
        this.router.navigate(['/dashboard']);
        return of(null);
      })
    );
  }

  refreshIssue(issueId: string): Observable<Issue> {
    return this.issueService.getIssue(issueId).pipe(
      tap((issue) => {
        this.updateIssue(issue);
      }),
      catchError(() => {
        this.router.navigate(['/dashboard']);
        return of(null);
      })
    );
  }

  refreshArticle(contributionId: string): Observable<Contribution> {
    if (contributionId === 'new') {
      this.updateArticle(null);
      return of(null);
    } else {
      return this.contributionService.getContribution(contributionId).pipe(
        tap((article) => {
          this.updateArticle(article);
        }),
        catchError(() => {
          this.router.navigate(['/dashboard']);
          return of(null);
        })
      );
    }
  }

  refreshAdvertisement(advertisementId?: string): Observable<AdResource> {
    if (advertisementId) {
      return this.advertisementService.getAdvertisement(advertisementId).pipe(
        tap((article) => {
          this.updateAdvertisement(article);
        }),
        catchError(() => {
          this.router.navigate(['/dashboard']);
          return of(null);
        })
      );
    } else {
      this.updateAdvertisement(null);
      return of(null);
    }
  }

  refreshAccessRequestList(): Observable<PublicationListItem[]> {
    return this.accessRequestService
      .getOwnRequests(this.authService.getCurrentUser().id)
      .pipe(
        map((results: Array<any>) =>
          results.filter((invite) => invite.status !== 'approved')
        ),
        map((list: Array<any>) => {
          return list.map((item) => {
            const pub = new Publication().deserialize(item.publication);
            return new PublicationListItem().deserialize({
              publication: pub,
              id: pub.id,
              cover: pub.cover,
              name: pub.name,
              description: pub.description,
              status: item.status,
              numIssues: pub.publicationIssues.length,
            });
          });
        }),
        tap((list) => {
          this.updateAccessRequestList(list);
        }),
        catchError(() => {
          return of(null);
        })
      );
  }

  currentPublicationIssue(): Observable<{
    publication: Publication;
    issue: Issue;
  }> {
    return zip(this.currentPublication, this.currentIssue).pipe(
      map(([publication, issue]) => {
        return {publication, issue};
      })
    );
  }

  currentPublicationIssueSubmissions(): Observable<{
    publication: Publication;
    issue: Issue;
    submissions: Contribution[];
  }> {
    return zip(
      this.currentPublication,
      this.currentIssue,
      this.currentArticleList
    ).pipe(
      map(([publication, issue, submissions]) => {
        return {publication, issue, submissions};
      })
    );
  }

  currentPublicationIssueAdvertisements(): Observable<{
    publication: Publication;
    issue: Issue;
    advertisements: AdResource[];
  }> {
    return zip(
      this.currentPublication,
      this.currentIssue,
      this.currentAdvertisementList
    ).pipe(
      map(([publication, issue, advertisements]) => {
        return {publication, issue, advertisements};
      })
    );
  }

  currentPublicationIssueArticle(): Observable<{
    publication: Publication;
    issue: Issue;
    contribution: Contribution;
  }> {
    return zip(
      this.currentPublication,
      this.currentIssue,
      this.currentArticle
    ).pipe(
      map(([publication, issue, contribution]) => {
        return {publication, issue, contribution};
      })
    );
  }

  currentPublicationIssueAdvertisement(): Observable<{
    publication: Publication;
    issue: Issue;
    advertisement: AdResource;
  }> {
    return zip(
      this.currentPublication,
      this.currentIssue,
      this.currentAdvertisement,
    ).pipe(
      map(([publication, issue, advertisement]) => {
        return {publication, issue, advertisement};
      })
    );
  }

  private checkPermission(pub: Publication): PublicationListItemPerms {
    const ret = {
      showEditPub: role.hasPermission(pub.role, permission.editPublication),
      showCreateIssue: role.hasPermission(pub.role, permission.createIssue),
      // subscriber: pub.role === 'subscriber',
      issueMenu: [
        'managingEditor',
        'editorialStaff',
        'contributor',
        'advertiser',
      ].includes(pub.role),
    };
    return ret;
  }
}
