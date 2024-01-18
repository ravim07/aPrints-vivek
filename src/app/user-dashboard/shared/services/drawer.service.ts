import { Injectable } from '@angular/core';
import { AuthService } from 'auth/auth.service';
import { Subject } from 'rxjs';
import { UserDashboardModule } from 'user-dashboard/user-dashboard.module';
import { DiscussionEntry } from '_models';
import { Publication } from '_models/publication.model';
@Injectable({ providedIn: UserDashboardModule })
export class DrawerService {
  public drawerToggleSubject: Subject<any> = new Subject<any>();
  public publicationSubject: Subject<Publication> = new Subject<Publication>();
  public unreadMsgsSubject: Subject<any> = new Subject<any>();
  private userId: string;
  constructor(private authService: AuthService) {
    this.userId = this.authService.getCurrentUser().id;
  }
  toggle() {
    return this.drawerToggleSubject.next();
  }
  setPublicationSubject(publication: Publication) {
    this.publicationSubject.next(publication);
    this.getNumberOfUnreadMsgs(publication.id, publication.discussionEntries);
  }
  setLastMsgsRead(pubId: string, msgs: Array<DiscussionEntry>) {
    const discussionsArr = this.parseLastMsgsRead(pubId);
    discussionsArr[this.userId][pubId] = [...msgs];
    // console.log('RESULT TO PARSE', discussionsArr);
    this.stringifyLastMsgsRead(discussionsArr);
    this.getNumberOfUnreadMsgs(pubId, msgs);
  }
  stringifyLastMsgsRead(arr: Array<DiscussionEntry> | {}) {
    window.localStorage.removeItem('readDiscussions');
    localStorage.setItem('readDiscussions', JSON.stringify(arr));
  }
  parseLastMsgsRead(pubId: string): Array<DiscussionEntry> | {} {
    let discussionsStorage = JSON.parse(
      localStorage.getItem('readDiscussions')
    );
    // console.log('STORAGE ALL MSGS', discussionsStorage);
    if (discussionsStorage && discussionsStorage !== null) {
      if (discussionsStorage[this.userId]) {
        // console.log('STORAGE USER MSGS', discussionsStorage[this.userId]);
        if (discussionsStorage[this.userId][pubId]) {
          // console.log('STORAGE PUB MSGS', discussionsStorage[this.userId][pubId]);
        } else {
          // console.log('no pub info');
          discussionsStorage[this.userId][pubId] = [];
        }
      } else {
        // console.log('no user and pub info');
        discussionsStorage[this.userId] = {};
        discussionsStorage[this.userId][pubId] = [];
      }
    } else {
      // console.log('no info at all');
      discussionsStorage = {};
      discussionsStorage[this.userId] = {};
      discussionsStorage[this.userId][pubId] = [];
    }
    return discussionsStorage;
  }
  getNumberOfUnreadMsgs(
    pubId: string,
    actualDiscussionMsgs: Array<DiscussionEntry>
  ) {
    let num = null;
    // console.log('ACTUAL MSGS', actualDiscussionMsgs);
    if (actualDiscussionMsgs && actualDiscussionMsgs.length > 0) {
      const discussionsArr = this.parseLastMsgsRead(pubId);
      if (discussionsArr[this.userId][pubId].length > 0) {
        const result =
          actualDiscussionMsgs.length -
          discussionsArr[this.userId][pubId].length;
        if (result === 0) {
          console.log('its 0');
        } else {
          num = result;
          console.log('the substraction its > 0', num);
        }
      } else {
        num = actualDiscussionMsgs.length;
        console.log('theres no messages stored for user or pub', num);
      }
    } else {
      console.log('there are no messages');
    }
    this.unreadMsgsSubject.next(num);
  }
}
