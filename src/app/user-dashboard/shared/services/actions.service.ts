import { EventEmitter, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { environment } from 'environments/environment';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { Observable } from 'rxjs';
import { UserDashboardModule } from 'user-dashboard/user-dashboard.module';
import { Member, PageAdPricing, permissionEnum, role } from '_models';
import { DonationSummary } from '_models/donation-summary.model';
import { Publication } from '_models/publication.model';
import { SubscriptionSummary } from '_models/subscription-summary.model';
import { TriggerOrCallbackOptions } from '_models/trigger.interface';
import {
  AdvertisingService,
  FundraisingService,
  InvitationService,
  IssueService,
  MemberService,
  PaymentService,
  PermissionsService,
  PublicationService,
} from '_services';
import { BaseActionsService } from '_services/base-actions.service';
import { IssueNewComponent } from '_shared/components/issue-new/issue-new.component';
import { PublicationNewComponent } from '_shared/components/publication-new/publication-new.component';
import { AlertService } from '_shared/services';
import { AdRateSheetComponent } from '../components/ad-rate-sheet/ad-rate-sheet.component';
import { AdvertisingReportComponent } from '../components/advertising-report/advertising-report.component';
import { ImportCsvFileComponent, ImportCsvFileDialogData, } from '../components/import-csv-file/import-csv-file.component';
import { InviteNewMemberComponent } from '../components/invite-new-member/invite-new-member.component';
import { MemberNewComponent, NewMemberData, } from '../components/member-new/member-new.component';
import { ShareComponent } from '../components/share/share.component';
import { SponsorshipsLevelsComponent } from '../components/sponsorship-levels/sponsorships-levels.component';
import { SponsorshipsReportComponent } from '../components/sponsorship-report/sponsorship-report.component';
import { SubscriberManualNewComponent } from '../components/subscriber-manual-new/subscription-manual-new.component';
import { SubscriptionReportComponent } from '../components/subscription-report/subscription-report.component';
import { SubscriptionTypesComponent } from '../components/subscription-types/subscription-types.component';
import { SelectSponsorshipLevelComponent } from 'components/select-sponsorship-level/select-sponsorship-level.component';
import { SelectAdvertisementTypeComponent } from 'components/select-advertisement-type/select-advertisement-type.component';
import { SelectSubscriptionTypeComponent } from 'components/select-subscription-type/select-subscription-type.component';
import { Router } from '@angular/router';
import { ShippingAddressFormComponent } from '_shared/components';

@Injectable({ providedIn: UserDashboardModule })
export class ActionsService extends BaseActionsService {
  pdfFolder = `${ environment.assetsUrl }/template-pdfs/`;

  constructor(
    private alertService: AlertService,
    dialog: MatDialog,
    private publicationService: PublicationService,
    private invitationService: InvitationService,
    private memberService: MemberService,
    private issueService: IssueService,
    private fundraisingService: FundraisingService,
    private advertisingService: AdvertisingService,
    private paymentService: PaymentService,
    private permissionsService: PermissionsService,
    private router: Router,
  ) {
    super(dialog);
  }

  newPublication(callback: Function): void {
    const dialogConfig = this.setDialogConfig(
      ['flat-dialog', 'normal', 'height-600', 'width-550'],
      { name: '', organization: '', description: '' }
    );
    this.dialog
      .open(PublicationNewComponent, dialogConfig)
      .afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe((result) => {
        if (result) {
          this.publicationService.createPublication(result).subscribe(
            (pub) => {
              this.alertService.showAlertSuccess(
                'Publication created successfully'
              );
              callback(pub);
            },
            (errorData: any) => {
              this.alertService.showAlertDanger(
                'An error has occurred. Publication not created.'
              );
              console.log(errorData);
            }
          );
        }
      });
  }

  editPublication(
    publication: Publication,
    trigger: EventEmitter<string>
  ): void {
    const dialogConfig = this.setDialogConfig(
      ['flat-dialog', 'normal', 'height-650', 'width-550'],
      {
        name: publication.name,
        organization: publication.organization,
        description: publication.description,
        edit: true,
      }
    );
    this.dialog
      .open(PublicationNewComponent, dialogConfig)
      .afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe((result) => {
        if (result) {
          delete result.edit;
          this.publicationService
            .updatePublication(publication.id, result)
            .subscribe(
              () => {
                this.alertService.showAlertSuccess('Saved changes.');
                trigger.emit('reload');
              },
              (errorData: any) => {
                this.alertService.showAlertDanger(
                  'An error has occurred. Changes were not saved.'
                );
                console.log(errorData);
              }
            );
        }
      });
  }

  sharePublicationLink(
    publication: Publication,
    trigger: EventEmitter<string>
  ): void {

    const canEdit = this.permissionsService.getPermission(
      permissionEnum.canEditShare,
      publication,
    );

    const dialogConfig = this.setDialogConfig(
      ['flat-dialog', 'normal-wide', canEdit ? 'height-650' : '', 'width-800'],
      publication
    );
    this.dialog
      .open(ShareComponent, dialogConfig)
      .afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        trigger.emit('reload');
      });
  }

  newMember(publication: Publication, options: TriggerOrCallbackOptions): void {
    const dialogConfig = this.setDialogConfig(
      ['flat-dialog', 'normal', 'height-600', 'width-550'],
      {
        name: '',
        email: '',
        role: '',
        currentUserRole: publication.role,
      }
    );
    this.dialog
      .open(MemberNewComponent, dialogConfig)
      .afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe((result) => {
        if (result) {
          delete result.currentUserRole;
          result.inviteTargetId = publication.id;
          if (result.role === role.managingEditor) {
            this.sendInvitationManagingEditor(result, options);
          } else if (result.role === role.editorialStaff) {
            this.sendInvitationEditorialStaff(result, options);
          } else if (result.role === role.contributor) {
            this.sendInvitationContributor(result, options);
          }
        }
      });
  }

  editMember(
    member: Member,
    publication: Publication,
    options: TriggerOrCallbackOptions
  ): void {
    const dialogConfig = this.setDialogConfig(
      ['flat-dialog', 'normal', 'height-650', 'width-550'],
      {
        name: member.name,
        organization: member.email,
        role: member.role,
        currentUserRole: publication.role,
        edit: true,
      }
    );
    this.dialog
      .open(MemberNewComponent, dialogConfig)
      .afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe((result) => {
        if (result) {
          delete result.currentUserRole;
          delete result.edit;
          this.memberService
            .saveMember(publication.id, member.id, member.role, result.role)
            .subscribe(
              () => {
                this.alertService.showAlertSuccess('Member Saved.');
                this.triggerOrCallback(options);
              },
              (errorData) => {
                this.alertService.showAlertDanger(
                  'An error has occurred. Changes were not saved.'
                );
                console.log(errorData);
              }
            );
        }
      });
  }

  newIssue(publication: Publication, options: TriggerOrCallbackOptions): void {
    const dialogConfig = this.setDialogConfig(
      ['flat-dialog', 'normal', 'space-around', 'height-700', 'width-700'],
      { name: '', publication: publication }
    );
    this.dialog
      .open(IssueNewComponent, dialogConfig)
      .afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe((result) => {
        if (result && result.data) {
          this.issueService.createIssue(publication.id, result.data).subscribe(
            () => {
              this.alertService.showAlertSuccess('Issue created successfully');
              this.triggerOrCallback(options);
            },
            (errorData: any) => {
              this.alertService.showAlertDanger(
                'An error has occurred. Issue not created.'
              );
              console.log(errorData);
            }
          );
        }
      });
  }

  deleteMember(
    publication: Publication,
    memberId: string,
    roleStr: string,
    callback: Function
  ): void {
    let $obs: Observable<any>;
    if (publication.role === role.managingEditor) {
      $obs = this.memberService.deleteMember(publication.id, memberId, roleStr);
    } else if ((publication.role = role.editorialStaff)) {
      $obs = this.memberService.deleteContributor(publication.id, memberId);
    }

    this.confirmAction(
      {
        msg: 'Are you sure you want to delete this member?',
        okBtnTxt: 'Confirm delete',
        cancelBtnTxt: 'Cancel',
      },
      {
        obs: $obs,
        cb: () => {
          callback();
          this.alertService.showAlertSuccess('Member deleted!.');
        },
      }
    );
  }

  addSubscriber(
    publication: Publication,
    options: TriggerOrCallbackOptions
  ): void {
    const dialogConfig = this.setDialogConfig(
      [
        'flat-dialog',
        'normal-with-footer',
        'space-around',
        'width-550',
        'height-660',
      ],
      {
        url: publication.id,
        queryParams: '?open=subs',
        csvDialogName: 'addSubscriberCSV',
        manualDialogName: 'manualSubscriber',
        roleStr: 'subscriber',
      }
    );
    this.dialog
      .open(InviteNewMemberComponent, dialogConfig)
      .afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe((result) => {
        if (result === 'addSubscriberCSV') {
          this.addSubscriberCSV(publication, options);
        } else if (result === 'manualSubscriber') {
          this.addManualSubscriber(publication, options);
        } else if (Array.isArray(result)) {
          this.sendOneEmailInvitation(
            publication.id,
            result,
            options,
            'inviteSubscribers'
          );
        }
      });
  }

  deleteInvitation(
    publication: Publication,
    invitationId: string,
    callback: Function
  ): void {
    let $obs: Observable<any>;
    if (publication.role === role.managingEditor) {
      $obs = this.memberService.deleteInvitation(publication.id, invitationId);
      this.confirmAction(
        {
          msg: 'Are you sure you want to delete this member?',
          okBtnTxt: 'Confirm delete',
          cancelBtnTxt: 'Cancel',
        },
        {
          obs: $obs,
          cb: () => {
            callback();
            this.alertService.showAlertSuccess('Member deleted!.');
          },
        }
      );
    }


  }

  addSubscriberCSV(
    publication: Publication,
    options: TriggerOrCallbackOptions
  ) {
    this.openCSVImportDialog(
      {
        inputTooltip:
          'Click here to add a CSV file with a list of emails. ' +
          'We will send an invitation email to each one with a link to join your ' +
          'publication as a Subscriber',
        linkTooltip:
          'This example will help you create a CSV file we can use ' +
          'to send your emails',
        title: 'Import Subscribers',
        exampleLink: `${ this.pdfFolder }example.csv`,
        inputType: 'normal',
        type: 'addSubscriber',
      },
      publication,
      options,
      (result) => {
        this.sendOneEmailInvitation(
          publication.id,
          result.emails,
          options,
          'inviteSubscribers'
        );
      }
    );
  }

  addManualSubscriber(
    publication: Publication,
    options: TriggerOrCallbackOptions
  ): void {
    const dialogConfig2 = this.setDialogConfig(
      [
        'flat-dialog',
        'manual-subscriber',
        'space-around',
        'width-810',
        'height-850',
      ],
      publication.id
    );
    this.dialog
      .open(SubscriberManualNewComponent, dialogConfig2)
      .afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe((result) => {
        if (result === 'addSubscriber') {
          this.addSubscriber(publication, options);
        } else if (result === 'addManualSubscriberCSV') {
          this.addManualSubscriberCSV(publication, options);
        } else if (typeof result === 'object') {
          const data = {
            subscriptionType: 'selfManaged',
            amount: 0,
            email: result.email,
            name: result.name,
            mailingAddress: {
              addressedTo: result.name,
              address1: result.address,
              phone: result.phone ? result.phone : '',
            },
          };
          this.paymentService.addSubscription(publication.id, data).subscribe(
            () => {
              this.alertService.showAlertSuccess('Subscriber Saved!');
              this.triggerOrCallback(options);
            },
            (errorData) => {
              this.alertService.showAlertDanger(
                'An error has occurred. Subscriber not saved.'
              );
              console.log(errorData);
            }
          );
        }
      });
  }

  addManualSubscriberCSV(
    publication: Publication,
    options: TriggerOrCallbackOptions
  ) {
    this.openCSVImportDialog(
      {
        inputTooltip:
          'Add a CSV file with a list of subscribers ' +
          'with their full mailing address. We will ' +
          'add them to this publication for you.',
        linkTooltip:
          'This example will help you create a CSV file we can use ' +
          'to send your emails',
        title: 'Import Self Managed Subscribers',
        exampleLink: `${ this.pdfFolder }exampleSubs.csv`,
        inputType: 'manual',
        type: 'addManualSubscriber',
      },
      publication,
      options,
      (result) => {
        console.log(result);
        this.fundraisingService
          .importSelfManagedSubscriptions(publication.id, result)
          .subscribe(
            () => {
              this.alertService.showAlertSuccess('Subscribers Imported!');
              this.triggerOrCallback(options);
            },
            (errorData) => {
              this.alertService.showAlertDanger(
                'An error has occurred. Subscribers not imported.'
              );
              console.log(errorData);
            }
          );
      }
    );
  }

  openCSVImportDialog(
    dialogData: ImportCsvFileDialogData,
    publication: Publication,
    options: TriggerOrCallbackOptions,
    cb: Function
  ) {
    const backFlowsEnum = new Set([
      'addSubscriber',
      'addSponsor',
      'addAdvertiser',
      'addManualSubscriber',
      'addManualSponsor',
      'addManualAdvertiser',
    ]);
    const dialogConfig = this.setDialogConfig(
      ['flat-dialog', 'csv-import', 'space-around', 'width-800', 'height-450'],
      dialogData
    );
    this.dialog
      .open(ImportCsvFileComponent, dialogConfig)
      .afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe((result) => {
        if (result === 'close') {
          this.triggerOrCallback(options);
        } else if (typeof result === 'object') {
          cb(result);
        } else if (backFlowsEnum.has(result)) {
          console.log('Go back to', result);
          this[result](publication, options);
        }
      });
  }

  manageSubscriptionTypes(
    publication: Publication,
    subscriptionSummary: SubscriptionSummary,
    options: TriggerOrCallbackOptions
  ): void {
    const dialogConfig = this.setDialogConfig(
      ['flat-dialog', 'normal', 'space-around', 'width-1100'],
      {
        publication: publication,
        subscriptionSummary: subscriptionSummary,
      }
    );
    this.dialog
      .open(SubscriptionTypesComponent, dialogConfig)
      .afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.triggerOrCallback(options);
      });
  }

  subscriptionsReport(
    publication: Publication,
    options: TriggerOrCallbackOptions
  ) {
    this.fundraisingService.getSubscriptions(publication.id).subscribe(
      (subscriptions) => {
        const dialogConfig = this.setDialogConfig(
          ['flat-dialog', 'report', 'space-around', 'width-1100'],
          {
            publication: publication,
            subscriptions: subscriptions,
          }
        );
        this.dialog
          .open(SubscriptionReportComponent, dialogConfig)
          .afterClosed()
          .pipe(untilDestroyed(this))
          .subscribe(() => {
            this.triggerOrCallback(options);
          });
      },
      (errorData) => {
        console.log('Error: ', errorData);
      }
    );
  }

  addSponsor(
    publication: Publication,
    options: TriggerOrCallbackOptions
  ): void {
    const dialogConfig = this.setDialogConfig(
      ['flat-dialog', 'normal', 'space-around', 'width-550', 'height-660'],
      {
        url: publication.id,
        queryParams: '?open=sponsor',
        csvDialogName: 'addSponsorCSV',
        manualDialogName: 'manualSponsor',
        roleStr: 'sponsor',
        hideFooter: true,
      }
    );
    this.dialog
      .open(InviteNewMemberComponent, dialogConfig)
      .afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe((result) => {
        if (result === 'addSponsorCSV') {
          this.addSponsorCSV(publication, options);
        } else if (Array.isArray(result)) {
          this.sendOneEmailInvitation(
            publication.id,
            result,
            options,
            'inviteSponsors'
          );
        }
      });
  }

  addSponsorCSV(publication: Publication, options: TriggerOrCallbackOptions) {
    this.openCSVImportDialog(
      {
        inputTooltip:
          'Click here to add a CSV file with a list of emails. ' +
          'We will send an invitation email to each one with a link to join your ' +
          'publication as a Sponsor',
        linkTooltip:
          'This example will help you create a CSV file we can use ' +
          'to send your emails',
        title: 'Import Sponsors',
        exampleLink: `${ this.pdfFolder }example.csv`,
        inputType: 'normal',
        type: 'addSponsor',
      },
      publication,
      options,
      (result) => {
        this.sendOneEmailInvitation(
          publication.id,
          result.emails,
          options,
          'inviteSponsors'
        );
      }
    );
  }

  sendOneEmailInvitation(
    pubId: string,
    result: string[],
    options: TriggerOrCallbackOptions,
    method: string
  ) {
    this.fundraisingService[method](pubId, result).subscribe(
      () => {
        this.alertService.showAlertSuccess('Invitation sent.');
        this.triggerOrCallback(options);
      },
      (errorData: any) => {
        this.alertService.showAlertDanger(
          'An error has occurred. Invitation not sent.'
        );
        console.log(errorData);
      }
    );
  }

  manageSponsorshipLevels(
    publication: Publication,
    sponsorshipSummary: DonationSummary,
    options: TriggerOrCallbackOptions
  ): void {
    const dialogConfig = this.setDialogConfig(
      ['flat-dialog', 'normal', 'space-around', 'width-1100'],
      {
        publication: publication,
        sponsorshipSummary: sponsorshipSummary,
      }
    );
    this.dialog
      .open(SponsorshipsLevelsComponent, dialogConfig)
      .afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.triggerOrCallback(options);
      });
  }

  sponsorshipReport(
    publication: Publication,
    options: TriggerOrCallbackOptions
  ) {
    this.fundraisingService.getDonations(publication.id).subscribe(
      (donations) => {
        const dialogConfig = this.setDialogConfig(
          ['flat-dialog', 'report', 'space-around', 'width-1100'],
          {
            publication: publication,
            donations: donations,
          }
        );
        this.dialog
          .open(SponsorshipsReportComponent, dialogConfig)
          .afterClosed()
          .pipe(untilDestroyed(this))
          .subscribe(() => {
            this.triggerOrCallback(options);
          });
      },
      (errorData) => {
        console.log('Error: ', errorData);
      }
    );
  }

  manageAdRateSheet(
    publication: Publication,
    options: TriggerOrCallbackOptions
  ): void {
    const dialogConfig = this.setDialogConfig(
      ['flat-dialog', 'normal', 'space-around', 'width-1100'],
      {
        publication: publication,
      }
    );
    this.dialog
      .open(AdRateSheetComponent, dialogConfig)
      .afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe((dataToSend) => {
        if (dataToSend) {
          this.advertisingService
            .batchEditPageAdPricing(publication.id, dataToSend)
            .subscribe(
              (data: {
                batchResult: PageAdPricing[];
                deleteResult: PageAdPricing[];
              }) => {
                this.alertService.showAlertSuccess(
                  'Ad Pricing saved successfully!'
                );
                this.triggerOrCallback(options);
              }
            );
        }
      });
  }

  advertisingReport(
    publication: Publication,
    options: TriggerOrCallbackOptions
  ) {
    this.advertisingService.getAdPayments(publication.id).subscribe(
      (adPayments) => {
        const dialogConfig = this.setDialogConfig(
          ['flat-dialog', 'report', 'space-around', 'width-1100'],
          {
            publication: publication,
            adPayments: adPayments,
          }
        );
        this.dialog
          .open(AdvertisingReportComponent, dialogConfig)
          .afterClosed()
          .pipe(untilDestroyed(this))
          .subscribe(() => {
            this.triggerOrCallback(options);
          });
      },
      (errorData) => {
        console.log('Error: ', errorData);
      }
    );
  }

  addAdvertiser(
    publication: Publication,
    options: TriggerOrCallbackOptions
  ): void {
    const dialogConfig = this.setDialogConfig(
      ['flat-dialog', 'normal', 'space-around', 'width-550', 'height-660'],
      {
        url: publication.id,
        queryParams: '?open=advertiser',
        csvDialogName: 'addAdvertiserCSV',
        manualDialogName: 'manualAdvertiser',
        roleStr: 'advertiser',
        hideFooter: true,
      }
    );
    this.dialog
      .open(InviteNewMemberComponent, dialogConfig)
      .afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe((result) => {
        if (result === 'addAdvertiserCSV') {
          this.addAdvertiserCSV(publication, options);
        } else if (Array.isArray(result)) {
          this.sendOneEmailInvitationAdvertiser(
            publication.id,
            result,
            options
          );
        }
      });
  }

  addAdvertiserCSV(
    publication: Publication,
    options: TriggerOrCallbackOptions
  ) {
    this.openCSVImportDialog(
      {
        inputTooltip:
          'Click here to add a CSV file with a list of emails. ' +
          'We will send an invitation email to each one with a link to join your ' +
          'publication as a Sponsor',
        linkTooltip:
          'This example will help you create a CSV file we can use ' +
          'to send your emails',
        title: 'Import Sponsors',
        exampleLink: `${ this.pdfFolder }example.csv`,
        inputType: 'normal',
        type: 'addSponsor',
      },
      publication,
      options,
      (result) => {
        this.sendOneEmailInvitationAdvertiser(
          publication.id,
          result.emails,
          options
        );
      }
    );
  }

  sendOneEmailInvitationAdvertiser(
    pubId: string,
    result: string[],
    options: TriggerOrCallbackOptions
  ) {
    this.advertisingService.inviteAdvertisers(pubId, result).subscribe(
      () => {
        this.alertService.showAlertSuccess('Invitation sent.');
        this.triggerOrCallback(options);
      },
      (errorData: any) => {
        this.alertService.showAlertDanger(
          'An error has occurred. Invitation not sent.'
        );
        console.log(errorData);
      }
    );
  }

  selectSponsorShipLevel(publicationId, donations) {
    const componentRef = this.dialog.open(SelectSponsorshipLevelComponent, {
      data: { donations },
      panelClass: [
        'flat-dialog',
        'normal-wide',
        'width-800',
        'mobile-support'
      ]
    });

    componentRef.afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe((result) => {
        console.log('Sponsor Level', result);
        if (result) {
          this.router.navigateByUrl(`publication/${ publicationId }/donate/${ result.id }`);
        }
      });

  }

  selectSubscriptionType(subscriptions) {
    this.dialog.open(SelectSubscriptionTypeComponent, {
      data: { subscriptions },
      panelClass: [
        'flat-dialog',
        'normal-wide',
        'width-800',
        'mobile-support'
      ]
    }).afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe((result) => {
        console.log(result);
        if (result) {
          this.router.navigateByUrl(`publication/${ result.publicationId }/subscribe/${ result.id }`);
        }
      });
  }

  selectAdvertisementType(pageAdsPricing, step) {
    this.dialog.open(SelectAdvertisementTypeComponent, {
      data: { pageAdsPricing },
      panelClass: [
        'flat-dialog',
        'normal-wide',
        // 'width-800',
        'mobile-support'
      ]
    }).afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe((result) => {
        console.log(result);
        if (result) {
          this.router.navigateByUrl(`publication/${ result.publicationId }/advertise/${ result.id }/${ step }`);
        }
        // advertise/${ obj.id }/${ step }
      });
  }

  addAddressCSV(
    publication: Publication,
    options: TriggerOrCallbackOptions
  ) {
    this.openCSVImportDialog(
      {
        inputTooltip:
          'Click here to add a CSV file with a list of address.',
        linkTooltip:
          'This example will help you create a CSV file we can use ' +
          'to add your address',
        title: 'Import Addresses',
        exampleLink: `${ this.pdfFolder }addresses-example.csv`,
        inputType: 'csv',
        type: 'addAddress',
      },
      publication,
      options,
      (result) => {
        console.log(result);
        options.cb(result);
      }
    );
  }

  addNewAddress(publication: Publication, options: TriggerOrCallbackOptions) {
    this.dialog.open(ShippingAddressFormComponent, {
      panelClass: ['flat-dialog', 'normal', 'height-1100', 'width-700', 'mobile-support'],
      disableClose: true,
      data: {
        publicationId: publication.id
      }
    }).afterClosed().subscribe(result => {
      this.triggerOrCallback(options, result);
    });
  }

  private sendInvitationManagingEditor(
    data: NewMemberData,
    options: TriggerOrCallbackOptions
  ) {
    this.invitationService.sendInvitationManagingEditor(data).subscribe(
      () => {
        this.alertService.showAlertSuccess('Invitation sent.');
        this.triggerOrCallback(options);
      },
      (errorData) => {
        this.alertService.showAlertDanger(
          'An error has occurred. Invitation not sent.'
        );
        console.log(errorData);
      }
    );
  }

  private sendInvitationEditorialStaff(
    data: NewMemberData,
    options: TriggerOrCallbackOptions
  ) {
    this.invitationService.sendInvitationEditorialStaff(data).subscribe(
      () => {
        this.alertService.showAlertSuccess('Invitation sent.');
        this.triggerOrCallback(options);
      },
      (errorData) => {
        this.alertService.showAlertDanger(
          'An error has occurred. Invitation not sent.'
        );
        console.log(errorData);
      }
    );
  }

  private sendInvitationContributor(data, options: TriggerOrCallbackOptions) {
    this.invitationService.sendInvitationContributor(data).subscribe(
      () => {
        this.alertService.showAlertSuccess('Invitation sent.');
        this.triggerOrCallback(options);
      },
      (errorData) => {
        this.alertService.showAlertDanger(
          'An error has occurred. Invitation not sent.'
        );
        console.log(errorData);
      }
    );
  }
}
