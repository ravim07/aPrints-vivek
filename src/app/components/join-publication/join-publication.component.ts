import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'auth/auth.service';
import { environment } from 'environments/environment';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { PublicationUrlService } from 'user-dashboard/shared/services';
import { issueStatus, User } from '_models';
import { Issue } from '_models/issue.model';
import { Publication } from '_models/publication.model';
import { InvitationService } from '_services';

@Component({
  selector: 'app-join-publication',
  templateUrl: './join-publication.component.html',
  styleUrls: ['./join-publication.component.scss'],
})
export class JoinPublicationComponent implements OnInit, OnDestroy {
  assetsUrl = environment.assetsUrl;
  currentUser: User;
  invitation;
  error = {
    show: false,
    message: '',
  };
  acceptInvitation = {
    showLoading: false,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invitationService: InvitationService,
    private publicationUrlService: PublicationUrlService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const token = this.route.snapshot.queryParams['token'];

    this.route.data.pipe(untilDestroyed(this)).subscribe((data) => {
      this.invitation = data.invitation;
      this.currentUser = data.currentUser;
      if (this.invitation.error) {
        this.error.show = true;
        this.error.message = this.invitation.error.msg;
      } else if (this.currentUser) {
        this.doAcceptInvitation(token);
      } else {
        this.goToRegister(token);
      }
    });
  }

  private goToRegister(token: string) {
    this.router.navigate(['/onboarding/register'], {
      queryParams: { 'join-publication': token },
    });
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  private doAcceptInvitation(token: string) {
    this.acceptInvitation.showLoading = true;
    this.invitationService.acceptInvitation(token).subscribe(
      (publication: Publication) => {
        this.redirectToIssue(publication);
      },
      (errorData) => {
        this.acceptInvitation.showLoading = false;
        this.error.message = errorData.error.msg;
        this.error.show = true;
        this.authService.logout(false);
        this.goToRegister(token);
      }
    );
  }

  private redirectToIssue(publication: Publication) {
    let redirectIssue: Issue;

    publication.publicationIssues.every((issue) => {
      if (
        issue.status === issueStatus.issueCreated ||
        issueStatus.printingDataConfirmed ||
        issueStatus.draftUploaded
      ) {
        redirectIssue = issue;
        return false;
      }
      return true;
    });

    if (!redirectIssue && publication.publicationIssues.length > 0) {
      redirectIssue =
        publication.publicationIssues[publication.publicationIssues.length - 1];
    }

    if (redirectIssue) {
      this.router.navigate([
        this.publicationUrlService.getLinkViewIssue(
          publication,
          redirectIssue.id
        ),
      ]);
    } else {
      this.goToHome();
    }
  }
  ngOnDestroy() {}
}
