import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'auth/auth.service';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { UserDashboardModule } from 'user-dashboard/user-dashboard.module';
import { permissionEnum } from '_models';
import { Issue } from '_models/issue.model';
import { Publication } from '_models/publication.model';
import { PermissionsService } from '_services';
import { ApiService } from '_services/api.service';
import { AlertService } from '_shared/services';
import { StoreService } from '../state/store.service';
import { AdvertisementEntry } from '_models/advertisement-entry.model';
import { AdResource } from '_models/ad-resource.model';
import { cleanupHtml } from 'user-dashboard/shared/services/utils';
import { AdvertisementService } from 'user-dashboard/shared/services/advertisement.service';
import { CkeditorUploaderService } from '_services/ckeditor-uploader.service';

declare var $: any;

@Injectable({ providedIn: UserDashboardModule })
export class AdService {
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
    private advertisementService: AdvertisementService,
    private permissionsService: PermissionsService,
    private ckeditorUploaderService: CkeditorUploaderService,
    private route: ActivatedRoute,
    private router: Router,
    private storeService: StoreService
  ) {
  }


  async insertSrcToImage(imageArr: Array<any>, entry: AdvertisementEntry) {
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

  saveAdvertisement(
    issue: Issue,
    advertisement: AdResource,
    entry: AdvertisementEntry,
    originalEntry: AdvertisementEntry
  ) {
    const addEntry = this.route.snapshot.data.addEntry;
    if (!advertisement.title) {
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

      waitForFiles().then(
        () => this.advertisementService
          .update(advertisement.id, advertisement).toPromise()
      ).then((response) => {
        advertisement = response;
        this.createEntry(issue, advertisement, entry);
      });
    } else {
      waitForFiles()
        .then(
          () => this.advertisementService
            .create(issue.id, advertisement).toPromise()
        )
        .then((response) => {
          entry.preventRecordAction = true;
          advertisement = response;
          this.createEntry(issue, advertisement, entry);
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
      a: this.storeService.refreshAdvertisement(id),
    }).subscribe({
      next: (value) => console.log(value),
      complete: () => {
        console.log('completed forkJoin');
        // this.router.navigate([`./../${id}`], {relativeTo: this.route});
      },
    });
  }

  setAttachmentsUploadSettings(
    publication: Publication,
    advertisement: AdResource,
    entry: AdvertisementEntry
  ): { url: string; token: string } | undefined {
    const returnValue = { url: undefined, token: undefined };
    if (
      advertisement.advertiser.id === this.authService.getCurrentUser().id ||
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
    advertisement: AdResource,
    entry: AdvertisementEntry
  ) {
    return (
      !(
        (advertisement &&
          advertisement.advertiser &&
          advertisement.advertiser.id ===
          this.authService.getCurrentUser().id) ||
        this.permissionsService.getPermission(
          permissionEnum.hasPermissionManagingEditor,
          publication
        )
      ) && entry.id
    );
  }

  checkChangesAndIfValid(
    advertisement: AdResource,
    entry: AdvertisementEntry,
    originalEntry: AdvertisementEntry,
    addEntry: boolean
  ): boolean {
    const notEmpty =
      advertisement.title && advertisement.title.length > 0 && !!entry && entry.article && entry.article.length > 0;
    const canBeSaved =
      (addEntry && notEmpty) ||
      (!!entry && !!originalEntry && entry.article !== originalEntry.article);
    return canBeSaved;
  }

  private createEntry(
    issue: Issue,
    advertisement: AdResource,
    entry: AdvertisementEntry,
  ) {
    this.advertisementService
      .addEntry(advertisement.id, entry)
      .subscribe(async (entryResponse) => {
        entry = entryResponse;
        this.alertService.showAlertSuccess('New advertisement created.');
        this.closeEditor(issue.publicationId, issue.id, advertisement.id);
      });
  }
}
