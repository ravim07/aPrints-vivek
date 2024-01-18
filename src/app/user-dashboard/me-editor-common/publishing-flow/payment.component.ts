// import { Component, Input, Output, EventEmitter, ViewChild, OnInit, OnDestroy } from '@angular/core';
// import { FormGroup } from '@angular/forms';

// import { AlertService } from '_shared/services';
// import { Pricing } from '_models';
// import { Publication } from '_models/publication.model';
// import { Issue } from '_models/issue.model';
// import { IssueService, StatesService, DraftService } from '_services';
// import { UserPublicationsService } from 'user-dashboard/shared/services';
// import { PageService, FormUtilService } from '_shared/services';
// import { PaymentInfoComponent } from '_shared/components';
// import { environment } from 'environments/environment';
// import { untilDestroyed } from 'ngx-take-until-destroy';

// @Component({
//   selector: 'app-submit-payment',
//   templateUrl: './payment.component.html',
//   styleUrls: ['./payment.component.scss']
// })
// export class PaymentComponent implements OnInit, OnDestroy {
//   assetsUrl = environment.assetsUrl;
//   @Input()
//   publication: Publication;
//   @Input()
//   issue: Issue;
//   pricing: Pricing;
//   _showPopup = false;
//   popupClass = '';
//   showErrorDatePicker = '';
//   paymentForm: FormGroup;
//   formStatusClass = '';
//   errorApi = '';
//   @ViewChild('paymentInfo', {static: false}) paymentInfo: PaymentInfoComponent;

//   constructor(
//     private issueService: IssueService,
//     private draftService: DraftService,
//     private userPublications: UserPublicationsService,
//     private formUtil: FormUtilService,
//     private stateService: StatesService,
//     private alertService: AlertService,
//     private pageService: PageService
//   ) {}

//   @Output()
//   popupEvent = new EventEmitter<any>();

//   @Input()
//   set showPopup(val: boolean) {
//     this._showPopup = val;
//     if (this._showPopup) {
//       this.createForm();
//       this.popupClass = 'modal-show';
//       this.pageService.addBodyClass('modal-open');
//     } else {
//       this.popupClass = '';
//       this.pageService.removeBodyClass('modal-open');
//     }
//   }

//   ngOnInit() {
//     this.pricing = new Pricing().deserialize(this.issue.pricingRequest);
//   }

//   closePopup(issue: Issue = null) {
//     this._showPopup = false;
//     this.popupClass = '';
//     this.pageService.removeBodyClass('modal-open');
//     this.popupEvent.emit({ type: 'popup.closed', issue: issue });
//   }

//   createForm() {
//     this.paymentForm = new FormGroup({});
//   }

//   private async submitPayment() {
//     this.formStatusClass = 'form-inprogress-submit';

//     if (this.paymentForm.valid) {
//       let issue = new Issue();
//       issue = Object.assign({}, this.paymentForm.value);
//       this.paymentInfo.data = this.paymentInfo.getChargeData();
//       const method = this.paymentInfo.paymentType;
//       if (this.paymentInfo.isStripe) {
//         this.paymentInfo.createCardChargeData()
//         .pipe(untilDestroyed(this)).subscribe(result => {
//           // console.log(result);
//           if (result.token) {
//             this.draftService.submitPayment(
//               this.issue.getCurrentDraft().id,
//               issue,
//               {
//                 email: this.paymentInfo.data.email,
//                 type: 'StripeCharge',
//                 stripeToken: result.token.id,
//                 lastFour: result.token.card.last4,
//                 brand: result.token.card.brand,
//                 method: method,
//               })
//               .subscribe(
//                 (newIssue: Issue) => {
//                   this.paymentInfo.card.clear();
//                   this.userPublications.update();
//                   this.issue = newIssue;
//                   this.closePopup(newIssue);
//                   this.alertService.showAlertSuccess('Draft submitted for print schedule successfully!');
//                 },
//                 (errorData: any) => {
//                   this.alertService.showAlertDangerApiError(errorData);
//                   this.formStatusClass = '';
//                 }
//               );
//           } else if (result.error) {
//             // Error creating the token
//             console.log(result.error.message);
//             this.errorApi = result.error.message;
//           }
//         });
//       // } else if(this.paymentInfo.isACH) {
//       //   this.paymentInfo.createBankAccountChargeData()
//       //   .subscribe(result => {
//       //     console.log(result);
//       //     if (result.token) {
//       //       this.draftService.submitPayment(
//       //         this.issue.getCurrentDraft().id,
//       //         issue,
//       //         {
//       //           ...(this.paymentInfo.data && {email: this.paymentInfo.data.email} || {}),
//       //           type: 'StripeCharge',
//       //           stripeToken: result.token.id,
//       //           ...(result.token.card &&
//       //             {
//       //               lastFour: result.token.card.last4,
//       //               brand: result.token.card.brand
//       //             } || {}),
//       //           ...(result.token.bank_account &&
//       //             {
//       //               lastFour: result.token.bank_account.last4,
//       //               bankName: result.token.bank_account.bank_name
//       //             } || {}),
//       //           method: method,
//       //         })
//       //         .subscribe(
//       //           (newIssue: Issue) => {
//       //             this.paymentInfo.card.clear();
//       //             this.userPublications.update();
//       //             this.issue = newIssue;
//       //             this.closePopup(newIssue);
//       //             this.alertService.showAlertSuccess('Draft submitted for print schedule successfully!');
//       //           },
//       //           (errorData: any) => {
//       //             this.alertService.showAlertDangerApiError(errorData);
//       //             this.formStatusClass = '';
//       //           }
//       //         );
//       //     } else if (result.error) {
//       //       // Error creating the token
//       //       console.log(result.error.message);
//       //       this.errorApi = result.error.message;
//       //     }
//       //   });
//       } else {
//         // console.log('Other than Stripe');
//         // console.log(this.paymentInfo.data);
//         this.draftService.submitPayment(
//           this.issue.getCurrentDraft().id,
//           issue,
//           {
//             ...this.paymentInfo.data,
//             type: 'StandardCharge',
//             method: method
//           })
//           .subscribe(
//             (newIssue) => {
//               this.userPublications.update();
//               this.issue = newIssue;
//               this.closePopup(newIssue);
//               this.alertService.showAlertSuccess('Draft submitted for print schedule successfully!');
//             },
//             (errorData: any) => {
//               this.alertService.showAlertDangerApiError(errorData);
//               this.formStatusClass = '';
//             }
//           );
//       }
//     } else {
//       this.formUtil.validateAllFormFields(this.paymentForm);
//       this.formStatusClass = '';
//       this.alertService.showAlertDanger('One or more fields have an error. Please check and try again.');
//     }
//   }

//   ngOnDestroy() {}
// }
