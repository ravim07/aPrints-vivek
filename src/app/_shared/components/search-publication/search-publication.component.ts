import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatRadioChange } from '@angular/material';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { Subject } from 'rxjs';
import { asyncForEach } from 'utils';
import { DonationLevel, PageAdPricing, SubscriptionType } from '_models';
import { Publication } from '_models/publication.model';
import {
  AdvertisingService,
  FundraisingService,
  SearchService,
} from '_services';

@Component({
  selector: 'app-search-publication',
  templateUrl: './search-publication.component.html',
  styleUrls: ['./search-publication.component.scss'],
})
export class SearchPublicationComponent implements OnInit, OnDestroy {
  url = 'onboarding';
  publications: Array<Publication>;
  currentPublication: Publication;
  searchTerm$ = new Subject<string>();
  connector = 'a';
  searchForm: FormGroup;
  searchResults: FormGroup;
  searching = false;

  @Input() continueText: string;
  @Input() role: string;

  @Output() selectedPublicationEvent: EventEmitter<
    Publication
  > = new EventEmitter(null);
  @Output() continueEvent: EventEmitter<boolean> = new EventEmitter(null);

  constructor(
    private searchService: SearchService,
    private fundRaisingService: FundraisingService,
    private advertisingService: AdvertisingService
  ) {}

  ngOnInit() {
    this.searchForm = new FormGroup({
      searchTerm: new FormControl(null),
    });
    this.searchResults = new FormGroup({
      publications: new FormControl(null),
    });
    this.searchService
      .searchPublication(this.searchTerm$)
      .pipe(untilDestroyed(this))
      .subscribe((results) => {
        if (results.length) {
          if (this.role === 'sponsor') {
            asyncForEach(results, (e: Publication) => {
              this.fundRaisingService
                .getListDonationsLevels(e.id)
                .subscribe((donationLevels: DonationLevel[]) => {
                  this.filterResults(donationLevels, e);
                  this.searching = false;
                });
            });
          } else if (this.role === 'subscriber') {
            // console.log(results);
            asyncForEach(results, (e: Publication) => {
              this.fundRaisingService
                .getListSubscriptionTypes(e.id)
                .pipe(untilDestroyed(this))
                .subscribe((subscriptionTypes: SubscriptionType[]) => {
                  this.filterResults(subscriptionTypes, e);
                  this.searching = false;
                });
            });
          } else if (this.role === 'advertiser') {
            // console.log(results);
            asyncForEach(results, (e: Publication) => {
              this.advertisingService
                .getListPageAdPricings(e.id)
                .pipe(untilDestroyed(this))
                .subscribe((adTypes: PageAdPricing[]) => {
                  this.filterResults(adTypes, e);
                  this.searching = false;
                });
            });
          } else {
            this.publications = undefined;
            this.currentPublication = undefined;
            this.publications = results;
            this.searching = false;
          }
        } else {
          this.searching = false;
        }
      });
  }

  filterResults(data, pub) {
    if (data.length > 0) {
      if (this.publications === undefined) {
        this.publications = [];
      }
      const filtered = data.filter((types) => types.status !== 'disabled');
      if (filtered.length > 0) {
        this.publications.push(pub);
      }
    }
  }

  selectPublication(event: MatRadioChange) {
    this.currentPublication = event.value;
    this.selectedPublicationEvent.emit(event.value);
  }

  continue() {
    this.continueEvent.emit(true);
  }

  resetForm() {
    this.searchForm.get('searchTerm').reset();
    this.searchResults.get('publications').reset();
  }

  refreshSearchBox(val: string) {
    this.searching = true;
    this.searchResults.get('publications').reset();
    if (val.length < 3) {
      this.publications = undefined;
    }
  }

  errorHandler(event) {
    event.target.display = 'none';
  }

  ngOnDestroy(): void {}
}
