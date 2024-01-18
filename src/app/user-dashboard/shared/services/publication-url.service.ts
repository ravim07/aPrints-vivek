import { Injectable } from '@angular/core';
import { permission, role } from '_models';
import { Publication } from '_models/publication.model';

@Injectable({ providedIn: 'root' })
export class PublicationUrlService {
  constructor() {}

  getLinkCreatePublication(): string {
    return '/dashboard/publication/create';
  }

  getLinkEditPublication(pub: Publication): string {
    if (role.hasPermission(pub.role, permission.editPublication)) {
      return '/dashboard/publication/edit/' + pub.id;
    }
    return '/dashboard';
  }

  getLinkViewIssue(
    pub: Publication,
    issueId: string,
    tab: string = 'none'
  ): string {
    if (!issueId) {
      return '/dashboard';
    } else if (
      pub.role === role.managingEditor ||
      pub.role === role.editorialStaff
    ) {
      return (
        '/dashboard/publication/' +
        pub.id +
        '/issues/' +
        issueId +
        '?tab=' +
        tab
      );
    } else if (pub.role === role.contributor) {
      return (
        '/dashboard/publication/' +
        pub.id +
        '/issues/' +
        issueId +
        '/submissions'
      );
    } else {
      return '/dashboard';
    }
  }

  getLinkViewPublicationSubscription(pubId: string): string {
    if (!!pubId) {
      return '/dashboard/publication/' + pubId + '/subscription';
    } else {
      return '/dashboard';
    }
  }

  getLinkViewPublicationAdResources(pub: Publication, issueId: string): string {
    if (!!issueId) {
      return (
        'dashboard/publication/' +
        pub.id +
        '/advertising/' +
        issueId +
        '/resources'
      );
    } else {
      return '/dashboard';
    }
  }

  getLinkEditIssue(pub: Publication, issueId: string): string {
    if (role.hasPermission(pub.role, permission.editIssue)) {
      return '/dashboard/publication/' + pub.id + '/issue/edit/' + issueId;
    }
    return '/dashboard';
  }

  getLinkCreateIssue(pub: Publication): string {
    if (role.hasPermission(pub.role, permission.createIssue)) {
      return '/dashboard/publication/' + pub.id + '/issue/create';
    }
    return '/dashboard';
  }

  getLinkFundraisingLink(pub: Publication): string {
    if (role.hasPermission(pub.role, permission.fundraisingSendInvites)) {
      return '/dashboard/publication/' + pub.id + '/fundraising/invites';
    }
    return '/dashboard';
  }

  getLinkFundraisingReportLink(pub: Publication): string {
    if (role.hasPermission(pub.role, permission.fundraisingReport)) {
      return '/dashboard/publication/' + pub.id + '/fundraising/report';
    }
    return '/dashboard';
  }

  getLinkFundraisingSubcriptionsReportLink(pub: Publication): string {
    if (role.hasPermission(pub.role, permission.fundraisingReport)) {
      return (
        '/dashboard/publication/' + pub.id + '/fundraising/subscription-report'
      );
    }
    return '/dashboard';
  }

  getLinkFundraisingLevelsLink(pub: Publication): string {
    if (role.hasPermission(pub.role, permission.fundraisingReport)) {
      return '/dashboard/publication/' + pub.id + '/fundraising/levels';
    }
    return '/dashboard';
  }

  getLinkFundraisingSubscriptionTypesLink(pub: Publication): string {
    if (role.hasPermission(pub.role, permission.fundraisingReport)) {
      return (
        '/dashboard/publication/' + pub.id + '/fundraising/subscriptionTypes'
      );
    }
    return '/dashboard';
  }

  getAdPricingMatrixLink(pub: Publication): string {
    if (role.hasPermission(pub.role, permission.advertisingMatrix)) {
      console.log('OK');
      return '/dashboard/publication/' + pub.id + '/advertising/pricingMatrix';
    }
    return '/dashboard';
  }

  getAdvertisingReportLink(pub: Publication): string {
    if (role.hasPermission(pub.role, permission.advertisingReport)) {
      return '/dashboard/publication/' + pub.id + '/advertising/report';
    }
    return '/dashboard';
  }

  getAdvertisingResourcesLink(pub: Publication, issueId: string): string {
    if (role.hasPermission(pub.role, permission.advertisingResources)) {
      return (
        'dashboard/publication/' + pub.id + '/advertising/resources/' + issueId
      );
    }
    return '/dashboard';
  }

  getAdvertisingInvitesLink(pub: Publication): string {
    if (role.hasPermission(pub.role, permission.advertisingInvites)) {
      return 'dashboard/publication/' + pub.id + '/advertising/invites';
    }
    return '/dashboard';
  }

  getSubscriptionsInvitesLink(pub: Publication): string {
    if (role.hasPermission(pub.role, permission.fundraisingSendInvites)) {
      return 'dashboard/publication/' + pub.id + '/subscriptions/invites';
    }
    return '/dashboard';
  }

  getManagedSubscriptionsLink(pub: Publication): string {
    if (role.hasPermission(pub.role, permission.fundraisingSendInvites)) {
      return 'dashboard/publication/' + pub.id + '/subscriptions/self-managed';
    }
    return '/dashboard';
  }

  getArticleLink(
    pub: Publication,
    issueId: string,
    articleId: string = 'new',
    addEntry: boolean = false
  ): string {
    if (
      pub.role === role.managingEditor ||
      pub.role === role.editorialStaff ||
      pub.role === role.contributor
    ) {
      let link =
        '/dashboard/publication/' +
        pub.id +
        '/issues/' +
        issueId +
        '/submissions/' +
        articleId;
      if (addEntry) {
        link = link + '/addEntry';
      }
      return link;
    }
    return '/dashboard';
  }
}
