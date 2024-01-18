import { BaseModel } from '_models';
import { ContributionEntry } from './contribution-entry.model';
import { ContributionFeedback } from './contribution-feedback.model';
import { Publication } from './publication.model';

export class Contribution extends BaseModel {
  title: string;
  article: string;
  issueId: string;
  status: string;
  contributor: { id: string; name: string };
  publication?: Publication;
  entries: ContributionEntry[];
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

    this.entries = new Array();
    if (entries) {
      let i = 1;
      let entryObj: ContributionEntry;
      entries.forEach((entry) => {
        entry.issueName = this.issueName;
        entry.versionStr = `Version ${i}`;
        entry.versionNumber = i;
        entryObj = new ContributionEntry().deserialize(entry);
        this.entries.push(entryObj);
        if (entryObj.contributionFeedback.length > 0) {
          this.allFeedback = [
            ...this.allFeedback,
            ...entryObj.contributionFeedback,
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
    this.author = this.contributor.name.split(' ')[0];
    const lastEntry = this.entries[this.entries.length - 1];
    this.lastUpdated = lastEntry ? lastEntry.entryDate : this.createdAt;

    return this;
  }
}
