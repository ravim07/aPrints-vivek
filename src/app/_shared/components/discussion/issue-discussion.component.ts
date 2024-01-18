import { HttpEventType } from '@angular/common/http';
import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'auth/auth.service';
import { environment } from 'environments/environment';
import {
  DiscussionEntry,
  DraftFeedback,
  IssueStatusTracking,
  Member,
  permission,
  role,
  User,
} from '_models';
import { Action } from '_models/action.model';
import { Donation } from '_models/donation.model';
import { Issue } from '_models/issue.model';
import { PageAdPayment } from '_models/page-ad-payment.model';
import { Publication } from '_models/publication.model';
import { Subscription } from '_models/subscription.model';
import {
  DraftService,
  IssueService,
  MemberService,
  PublicationService,
} from '_services';
import { AlertService } from '_shared/services';

@Component({
  selector: 'app-issue-discussion',
  templateUrl: './issue-discussion.component.html',
  styleUrls: ['./issue-discussion.component.scss'],
})
export class IssueDiscussionComponent implements OnInit, AfterViewInit {
  assetsUrl = environment.assetsUrl;

  _publication: Publication;
  _issue: Issue;
  comments = [];
  sendingImage = false;
  sendingText = false;
  loading = true;

  currentUser: User;
  showCommentPopUp = false;

  commentForm: FormGroup;
  fileUploadProgress = 0;

  filterSelected = 'all';

  @Input() publicationId: string;
  @Input() issueId: string;

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.createCommentForm();
  }

  ngAfterViewInit() {
    this.setComments();
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private publicationService: PublicationService,
    private memberService: MemberService,
    private draftService: DraftService,
    private alertService: AlertService,
    private issueService: IssueService,
    private formBuilder: FormBuilder
  ) {}

  createCommentForm() {
    this.commentForm = this.formBuilder.group({
      msg: ['', [Validators.required]],
    });
  }

  setComments(sent: string = 'none') {
    this.publicationService
      .getPublication(this.publicationId)
      .subscribe(async (pub) => {
        this._publication = pub; // console.log(pub);
        this.commentForm.reset();
        if (
          this._publication &&
          this._publication.discussionEntries &&
          this.issueId
        ) {
          this.issueService.getIssue(this.issueId).subscribe(async (issue) => {
            this._issue = issue; // console.log(this._issue);
            const members = await this.loadMembers(this._publication); // console.log(members);
            const feedbackArr = await this.setFeedback(); // console.log(feedbackArr);
            const mergedArr = this.mergeAndOrderByNewer([
              ...members,
              ...this._publication.timeline,
              ...feedbackArr,
            ]);
            // console.log(mergedArr);
            this.comments = mergedArr; // console.log(this._issue.discussionEntries);
            this.loading = false;
            // console.log('Comments Issue', this._publication);
            // console.log('Comments', this.comments);
            // console.log('Timeline', this._publication.timeline);
          });
        }
        switch (sent) {
          case 'file':
            this.sendingImage = false;
            this.alertService.showAlertSuccess('File sent!');
            break;
          case 'msg':
            this.sendingText = false;
            break;
        }
        this.commentForm.enable();
      });
  }

  async setFeedback() {
    let feedbackArr: DraftFeedback[] = [];
    feedbackArr = await this.draftService.getDraftFeedbackArr2(
      this._issue,
      true
    );
    // console.log('discussion withFeedbackOnly', feedbackArr);
    return feedbackArr.filter((o) => o.draftStatus === 'sendFeedback');
  }

  private mergeAndOrderByNewer(
    inputArr: Array<
      | Member
      | DiscussionEntry
      | Action
      | IssueStatusTracking
      | Donation
      | Subscription
      | PageAdPayment
      | DraftFeedback
    >
  ) {
    return [...inputArr].sort(
      (a, b) => b.dateAdded.valueOf() - a.dateAdded.valueOf()
    );
  }

  private excludeOwnerAndSelf(members: Member[]): Member[] {
    let newArr = [...members];
    // const currentUser = this.authService.getCurrentUser();
    newArr = newArr.filter(
      (o) => o.owner === false /*&& o.email !== currentUser.email*/
    );
    return newArr;
  }

  private async loadMembers(publication: Publication): Promise<Member[]> {
    return new Promise((resolve, reject) => {
      try {
        if (
          this.authService.isRole(role.admin) ||
          (role.hasPermission(
            publication.role,
            permission.manageManagingEditors
          ) &&
            role.hasPermission(publication.role, permission.manageEditors) &&
            role.hasPermission(publication.role, permission.manageContributors))
        ) {
          this.memberService.getMembers(publication.id).subscribe((members) => {
            const result = this.excludeOwnerAndSelf(members);
            resolve(result);
          });
        } else if (
          role.hasPermission(publication.role, permission.manageContributors)
        ) {
          this.memberService
            .getContributors(publication.id)
            .subscribe((members) => {
              const result = this.excludeOwnerAndSelf(members);
              resolve(result);
            });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  inputFileChange($event) {
    $event.preventDefault();
    const files = [];
    files.push($event.target.files[0]);
    this.sendingImage = true;
    this.commentForm.disable();
    // console.log(files);
    this.fileUploadProgress = 0;
    const proms = files.map(
      async (file, i) =>
        new Promise((resolve, reject) => {
          this.publicationService
            .createDiscussionCommentAndAttachFile(
              this.publicationId,
              this.issueId,
              file
            )
            .subscribe(
              async (events) => {
                // console.log(events);
                if (events.type === HttpEventType.Response) {
                  console.log(events.body);
                  this.setComments('file');
                  resolve(true);
                }
              },
              (err) => {
                this.alertService.showAlertDanger(
                  'Upload failed! Make sure you are sending an image. Upload will fail with other file types!'
                );
                this.sendingImage = false;
                this.commentForm.enable();
                reject(err);
              }
            );
        })
    );
    const fullProm = this.progressPromise(proms, (t: number, l: number) => {
      this.fileUploadProgress = this.calcProgress(t, l);
      // console.log(this.fileUploadProgress);
    });
  }

  private progressPromise(promises: Promise<any>[], tickCallback: Function) {
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

  private calcProgress(completed: number, total: number) {
    return Math.round((completed / total) * 100);
  }

  saveComment() {
    this.sendingText = true;
    const data = this.commentForm.getRawValue(); // console.log('data to send Discussion', data);
    data.issueId = this.issueId;
    if (data.msg) {
      this.publicationService
        .newDiscussionEntry(this.publicationId, data)
        .subscribe((res) => {
          // console.log(res);
          this.setComments('msg');
        });
    } else {
      this.sendingText = false;
      this.alertService.showAlertDanger('Please provide a message!');
    }
  }

  trackByIdx(i) {
    return i.id ? i.id : i.dateCreated;
  }

  setFilter() {}

  goToCommentsUrl(
    comment:
      | Member
      | DiscussionEntry
      | Action
      | IssueStatusTracking
      | Donation
      | Subscription
      | PageAdPayment
      | DraftFeedback
  ) {
    if (comment.redirectUrl) {
      console.log(comment.redirectUrl);
      this.router.navigate([comment.redirectUrl]);
    }
  }
}
