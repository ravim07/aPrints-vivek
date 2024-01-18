import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'auth/auth.guard';
import { role } from '_models';
import { UserDashboardComponent } from '.';
import {
  DashboardSearchPublicationComponent,
  IssueDetailsComponent,
  IssuesComponent,
  PublicationsComponent,
  SubmissionComponent,
  SubmissionsComponent,
} from './dashboard-common';
import { MailingPrefsComponent, MembersComponent, PrintSpecsComponent, } from './me-editor-common';
import { AdvertisingComponent } from './me-editor-common/advertising';
import { SponsorshipsComponent } from './me-editor-common/sponsorship';
import { SubscriptionsComponent } from './me-editor-common/subscriptions';
import {
  AccessRequestsResolverService,
  AdsResolverService,
  AdvertisementResolverService,
  AdvertisingSummaryResolverService,
  ContributionResolverService,
  IssueResolverService,
  MembersResolverService,
  PendingInvitationsResolverService,
  PublicationResolverService,
  PublicationsListResolverService,
  SponsorshipSummaryResolverService,
  SubmissionsResolverService,
  SubscriptionSummaryResolverService,
} from './shared/resolvers';
import { UserDashboardGuard } from './user-dashboard-guard.service';
import { AdComponent, AdsComponent } from 'user-dashboard/advertiser';
import { TransfersComponent } from './payments/components/transfers/transfers.component';
import { PayoutsComponent } from 'user-dashboard/payments/components/payouts/payouts.component';
import { ForthcomingFeatureComponent } from 'user-dashboard/shared/components/forthcoming-feature/forthcoming-feature.component';
import { InvoiceListComponent } from 'user-dashboard/invoices/components/invoice-list/invoice-list.component';
import { InvoicesResolverService } from 'user-dashboard/shared/resolvers/invoices-resolver.service';
import { ShippingAddressComponent } from 'user-dashboard/shipping-address/shipping-address.component';

const userRoutes: Routes = [
  {
    path: '',
    component: UserDashboardComponent,
    runGuardsAndResolvers: 'always',
    children: [
      {
        path: '',
        canActivateChild: [AuthGuard, UserDashboardGuard],
        children: [
          {
            path: '',
            component: PublicationsComponent,
            resolve: {
              publications: PublicationsListResolverService,
              requests: AccessRequestsResolverService,
            },
            data: {
              expectedRoles: ['any'],
            },
          },
          {
            path: 'search-publication/:role',
            component: DashboardSearchPublicationComponent,
          },
          {
            path: 'publication/:publicationId',
            resolve: {
              publication: PublicationResolverService,
            },
            runGuardsAndResolvers: 'always',
            children: [
              {
                path: '',
                component: IssuesComponent,
                data: {
                  expectedRoles: [
                    role.managingEditor,
                    role.editorialStaff,
                    role.contributor,
                    role.advertiser,
                  ],
                },
              },
              {
                path: 'members',
                component: MembersComponent,
                resolve: {
                  members: MembersResolverService,
                  pendingInvitations: PendingInvitationsResolverService,
                },
                data: {
                  expectedRoles: [
                    role.managingEditor,
                    role.editorialStaff,
                    role.contributor,
                    role.advertiser,
                  ],
                },
              },
              {
                path: 'subscriptions',
                component: SubscriptionsComponent,
                resolve: {
                  subscriptionSummary: SubscriptionSummaryResolverService,
                },
                data: {
                  expectedRoles: [role.managingEditor, role.editorialStaff],
                },
              },
              {
                path: 'sponsorships',
                component: SponsorshipsComponent,
                resolve: {
                  sponsorshipSummary: SponsorshipSummaryResolverService,
                },
                data: {
                  expectedRoles: [role.managingEditor, role.editorialStaff],
                },
              },
              {
                path: 'advertising',
                component: AdvertisingComponent,
                resolve: {
                  advertisingSummary: AdvertisingSummaryResolverService,
                },
                data: {
                  expectedRoles: [role.managingEditor, role.editorialStaff],
                },
              },
              {
                path: 'transfers',
                component: TransfersComponent,
                resolve: {
                  // advertisingSummary: AdvertisingSummaryResolverService,
                  // publication: PublicationResolverService,
                },
                data: {
                  expectedRoles: [role.managingEditor],
                },
                children: [
                  {
                    path: 'deposits',
                    component: ForthcomingFeatureComponent,
                    resolve: {
                      // publication: PublicationResolverService,
                    },
                  },
                  {
                    path: 'withdrawals',
                    component: PayoutsComponent,
                    resolve: {
                      // advertisingSummary: AdvertisingSummaryResolverService,
                      // publication: PublicationResolverService,
                    },
                    data: {},
                  },
                ]
              },

              {
                path: 'invoices',
                component: InvoiceListComponent,
                data: { expectedRoles: [role.managingEditor], },
                resolve: {
                  invoices: InvoicesResolverService
                }
              },
              {
                path: 'mailing-prefs',
                component: MailingPrefsComponent,
                data: {
                  expectedRoles: [role.managingEditor, role.editorialStaff],
                },
              },
              {
                path: 'shipping',
                component: ShippingAddressComponent,
                data: {
                  expectedRoles: [role.managingEditor],
                },
              },
              {
                path: 'issues/:issueId',
                resolve: {
                  issue: IssueResolverService,
                },
                children: [
                  {
                    path: '',
                    component: IssueDetailsComponent,
                    data: {
                      expectedRoles: [
                        role.managingEditor,
                        role.editorialStaff,
                        role.contributor,
                        role.advertiser,
                      ],
                    },
                  },
                  {
                    path: 'submissions',
                    children: [
                      {
                        path: '',
                        component: SubmissionsComponent,
                        resolve: {
                          submissions: SubmissionsResolverService,
                        },
                      },
                      {
                        path: ':contributionId',
                        component: SubmissionComponent,
                        resolve: {
                          contribution: ContributionResolverService,
                        },
                      },
                    ],
                    data: {
                      expectedRoles: [
                        role.managingEditor,
                        role.editorialStaff,
                        role.contributor,
                      ],
                    },
                  },
                  {
                    path: 'ads',
                    children: [
                      {
                        path: '',
                        component: AdsComponent,
                        resolve: {
                          submissions: AdsResolverService,
                        },
                      },
                      {
                        path: 'new',
                        component: AdComponent,
                        resolve: {
                          contribution: AdvertisementResolverService,
                        },
                        data: {
                          addEntry: true,
                        }
                      },
                      {
                        path: ':advertisementId',
                        component: AdComponent,
                        resolve: {
                          contribution: AdvertisementResolverService,
                        },
                      },

                    ],
                    data: {
                      expectedRoles: [
                        role.managingEditor,
                        role.advertiser,
                      ],
                    },
                  },
                  {
                    path: 'print-specs',
                    component: PrintSpecsComponent,
                    data: {
                      expectedRoles: [role.managingEditor, role.editorialStaff],
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(userRoutes)],
  exports: [RouterModule],
})
export class UserDashboardRoutingModule {
}
