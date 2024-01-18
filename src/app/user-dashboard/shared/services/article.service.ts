import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'auth/auth.service';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { UserDashboardModule } from 'user-dashboard/user-dashboard.module';
import { permissionEnum } from '_models';
import { ContributionEntry } from '_models/contribution-entry.model';
import { Contribution } from '_models/contribution.model';
import { Issue } from '_models/issue.model';
import { Publication } from '_models/publication.model';
import { PermissionsService } from '_services';
import { ApiService } from '_services/api.service';
import { AlertService } from '_shared/services';
import { StoreService } from '../state/store.service';
import { ContributionService } from './contribution.service';
import { CkeditorUploaderService } from '_services/ckeditor-uploader.service';
import { cleanupHtml } from 'user-dashboard/shared/services/utils';

declare var $: any;

@Injectable({ providedIn: UserDashboardModule })
export class ArticleService {
  private uploading = new BehaviorSubject(false);
  uploadingObs = this.uploading.asObservable();
  private showProgress = new BehaviorSubject(false);
  showProgressObs = this.showProgress.asObservable();
  private uploadProgress = new BehaviorSubject(0);
  uploadProgressObs = this.uploadProgress.asObservable();

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private alertService: AlertService,
    private contributionsService: ContributionService,
    private permissionsService: PermissionsService,
    private route: ActivatedRoute,
    private router: Router,
    private storeService: StoreService,
    private ckeditorUploaderService: CkeditorUploaderService
  ) {
  }

  cleanupHtml(entry: ContributionEntry) {
    const parsedHtml = $(entry.article); // console.log(parsedHtml);
    const strings = ['\xa0'];
    parsedHtml
      .filter('p')
      .each(async function (i, elem) {
        const o = $(elem);
        // console.log(elem, o, o.text(), strings.includes(o.text()));
        if (strings.includes(o.text())) {
          o.remove();
        }
      })
      .end();
    entry.article = $('<div>').append(parsedHtml).html();
    // console.log(entry.article);
  }

  async insertSrcToImage(imageArr: Array<any>, entry: ContributionEntry) {
    const parsedHtml = $(entry.article);
    parsedHtml
      .find('img')
      .each(async function (i: number, elem: string) {
        // console.log(elem, imageArr[i]);
        await $(elem).attr('src', imageArr[i].url);
      })
      .end();
    entry.article = await $('<div>').append(parsedHtml).html();
  }

  compareAttachments() {
  }

  saveContribution(
    issue: Issue,
    contribution: Contribution,
    entry: ContributionEntry,
    originalEntry: ContributionEntry
  ) {
    const addEntry =
      this.route.snapshot.paramMap.get('contributionId') === 'new';
    if (!contribution.title) {
      this.alertService.showAlertDanger(
        'Article title cannot be empty! No changes were saved!'
      );
      return;
    } else if (!entry.article) {
      this.alertService.showAlertDanger(
        'Article text cannot be empty! No changes were saved!'
      );
      return;
    }

    const waitForFiles = () => {
      this.uploading.next(true);
      this.showProgress.next(true);
      return Promise.all(this.ckeditorUploaderService.requests)
        .then(() => {
          console.log('Request Files');
          this.uploading.next(false);
          this.showProgress.next(false);
        });
    };

    entry.article = cleanupHtml(entry.article);
    if (
      (addEntry && !!originalEntry) ||
      (originalEntry && entry.article !== originalEntry.article)
    ) {
      waitForFiles()
        .then(() =>
          this.contributionsService
            .update(contribution.id, contribution)
            .toPromise()
        )
        .then((response) => {
          contribution = response;
          this.createEntry(issue, contribution, entry);
        });
    } else {
      waitForFiles()
        .then(() =>
          this.contributionsService
            .create(issue.id, contribution).toPromise()
        ).then((response) => {
        entry.preventRecordAction = true;
        contribution = response;
        this.createEntry(issue, contribution, entry);
      });
    }
  }

  progressPromise(promises: Promise<any>[], tickCallback: Function) {
    const len = promises.length;
    let progress = 0;

    function tick(promise) {
      promise.then(function () {
        progress++;
        tickCallback(progress, len);
      });
      return promise;
    }

    return Promise.all(promises.map(tick));
  }

  calcProgress(completed: number, total: number) {
    return Math.round((completed / total) * 100);
  }

  closeEditor(pubId: string, issueId: string, id?: string) {
    forkJoin({
      p: this.storeService.refreshPublication(pubId),
      i: this.storeService.refreshIssue(issueId),
      a: this.storeService.refreshArticle(id),
    }).subscribe({
      next: (value) => console.log(value),
      complete: () => {
        console.log('completed forkJoin');
        // this.router.navigate([
        //   `/dashboard/publication/${pubId}` +
        //     `/issues/${issueId}/submissions${!!id ? '/' + id : ''}`,
        // ]);
      },
    });
  }

  setAttachmentsUploadSettings(
    publication: Publication,
    contribution: Contribution,
    entry: ContributionEntry
  ): { url: string; token: string } | undefined {
    const returnValue = { url: undefined, token: undefined };
    if (
      contribution.contributor.id === this.authService.getCurrentUser().id ||
      this.permissionsService.getPermission(
        permissionEnum.hasPermissionManagingEditor,
        publication
      )
    ) {
      if (entry.id) {
        returnValue.url = this.apiService.getApiUrl(
          `UploadedFiles/uploadS3OnlyFile`
        );
      }
      returnValue.token = this.authService.getToken();
      return returnValue;
    } else {
      return undefined;
    }
  }

  getIfEditorSetToReadOnly(
    publication: Publication,
    contribution: Contribution,
    entry: ContributionEntry
  ) {
    return (
      !(
        (contribution &&
          contribution.contributor &&
          contribution.contributor.id ===
          this.authService.getCurrentUser().id) ||
        this.permissionsService.getPermission(
          permissionEnum.hasPermissionManagingEditor,
          publication
        )
      ) && entry.id
    );
  }

  checkChangesAndIfValid(
    contribution: Contribution,
    entry: ContributionEntry,
    originalEntry: ContributionEntry,
    addEntry: boolean
  ): boolean {
    const notEmpty =
      (contribution.title && contribution.title.length > 0) && (!!entry && entry.article && entry.article.length > 0);
    const canBeSaved =
      (addEntry && notEmpty) ||
      (!!entry && !!originalEntry && entry.article !== originalEntry.article);
    return canBeSaved;
  }

  private createEntry(
    issue: Issue,
    contribution: Contribution,
    entry: ContributionEntry,
  ) {
    this.contributionsService
      .addEntry(contribution.id, entry)
      .subscribe(async (entryResponse) => {
        entry = entryResponse;
        this.alertService.showAlertSuccess('New article created.');
        this.closeEditor(issue.publicationId, issue.id, contribution.id);
      });
  }
}
