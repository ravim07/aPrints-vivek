import { BaseModel, ContributionFeedback } from '_models';
import { Publication } from './publication.model';
import { AdvertisementEntry } from '_models/advertisement-entry.model';

export class AdResource extends BaseModel {
  resource: string;
  uploadedFileIds: string[];

  title: string;
  article: string;
  issueId: string;
  status: string;
  advertiser: { id: string; name: string };
  publication?: Publication;
  entries: AdvertisementEntry[];
  author: string;
  lastUpdated: Date | string;
  commentsNumber = 0;
  allFeedback: Array<ContributionFeedback> = [];
  issueName: string;

  deserialize(input: any) {
    let entries;
    if (input._entries) {
      entries = input._entries;
      delete input._entries;
    }

    this.createdAt = new Date(this.createdAt);

    Object.assign(this, input);

    this.entries = [];
    if (entries) {
      let i = 1;
      let entryObj: AdvertisementEntry;
      entries.forEach((entry) => {
        entry.issueName = this.issueName;
        entry.versionStr = `Version ${i}`;
        entry.versionNumber = i;
        entryObj = new AdvertisementEntry().deserialize(entry);
        this.entries.push(entryObj);
        if (entryObj.advertisementFeedback.length > 0) {
          this.allFeedback = [
            ...this.allFeedback,
            ...entryObj.advertisementFeedback,
          ];
        }
        i++;
      });
      this.allFeedback = this.allFeedback.filter(
        (item) => item instanceof ContributionFeedback
      );
      this.commentsNumber = this.allFeedback.length;
      this.entries.sort((a, b) => a.versionNumber - b.versionNumber);
    }
    this.author = this.advertiser.name.split(' ')[0];
    const lastEntry = this.entries[this.entries.length - 1];
    this.lastUpdated = lastEntry ? lastEntry.entryDate : this.createdAt;

    return this;
  }
}
