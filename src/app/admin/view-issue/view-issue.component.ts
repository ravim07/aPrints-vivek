import { isPlatformBrowser } from '@angular/common';
import { HttpBackend, HttpClient } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { round } from 'utils';
import { Draft, Invoice, issueStatus, Member, PublicationPreview, role, } from '_models';
import { DonationSummary } from '_models/donation-summary.model';
import { Donation } from '_models/donation.model';
import { Issue } from '_models/issue.model';
import { Publication } from '_models/publication.model';
import { SubscriptionSummary } from '_models/subscription-summary.model';
import { Subscription } from '_models/subscription.model';
import { CustomerAccountService, DraftService, FundraisingService, IssueService, MemberService, PublicationService, } from '_services';
import { PaymentInfoComponent } from '_shared/components';
import { AlertService, FormUtilService, PageService, PdfViewerService } from '_shared/services';
import { saveAs } from 'file-saver';

@Component({
  selector: 'admin-view-issue',
  templateUrl: './view-issue.component.html',
  styleUrls: ['./view-issue.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ViewIssueComponent implements OnInit, OnDestroy {
  issue: Issue;
  publication: Publication;
  currentDraft: Draft;
  donations: { donations: Donation[]; summary: DonationSummary };
  subscriptions: {
    subscriptions: Subscription[];
    summary: SubscriptionSummary;
  };
  shippingForm: FormGroup;
  pricingForm: FormGroup;
  showAddCommentSection = false;
  showFormShipping = false;
  showFormPricing = false;
  showFormPayment = false;
  showFormConfirmPayment = false;
  showPaymentInfo = false;
  hasComments = false;
  statusList = [];
  popupClass = '';
  loading = true;
  issueStatusOptions = issueStatus;
  @ViewChild('downloadPdfLink', { static: false })
  downloadPdfLink;
  @ViewChild('downloadInvoiceLink', { static: false })
  downloadInvoiceLink;
  activeTab = 0;
  paymentForm: FormGroup;
  @ViewChild('paymentInfo', { static: false })
  paymentInfo: PaymentInfoComponent;
  errorApi = '';
  flatAmount: number;
  fee: number;
  chargeAmount: number;
  @ViewChild('dialogConfirmInvoiceSend', { static: false })
  dialogConfirmInvoiceSend;
  @ViewChild('dialogConfirmMarkInvoiceAsPaid', { static: false })
  dialogConfirmMarkInvoiceAsPaid;
  @ViewChild('dialogConfirmSendDueReminder', { static: false })
  dialogConfirmSendDueReminder;
  assetsUrl = environment.assetsUrl;
  btnPaymentLabel: string;
  totalAvailable = 0;
  dueDate: Date;
  invoiceDiscount: number;
  notes: string;
  minDate = new Date();
  commentObj = {
    msg: '',
    status: '',
  };
  publicationPreview: PublicationPreview;
  public Editor;
  members: Member[];
  loadingMembers = true;
  role;
  feedbackArr = [];
  Object = Object;
  @Output()
  popupEvent = new EventEmitter<any>();
  isBrowser = false;
  @Output() clickedCover;
  showPopupPdfViewer;
  @ViewChild('availableFundsSummaryPopup', { static: true }) availableFundsSummaryPopup: any;
  private http: HttpClient;
  private setting = {
    element: {
      dynamicDownload: null as HTMLElement,
    },
  };

  constructor(
    public formUtil: FormUtilService,
    private issueService: IssueService,
    private draftService: DraftService,
    private router: Router,
    private alertService: AlertService,
    private pageService: PageService,
    private dialog: MatDialog,
    private fundraisingService: FundraisingService,
    private publicationService: PublicationService,
    private memberService: MemberService,
    private pdfViewerService: PdfViewerService,
    handler: HttpBackend,
    private customerAccountService: CustomerAccountService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.http = new HttpClient(handler);
    if (this.isBrowser) {
      const ClassicEditor = require('@ckeditor/ckeditor5-build-classic');
      this.Editor = ClassicEditor;
      // register the custom element with the browser.
      this.Editor.defaultConfig = {
        toolbar: {
          items: [
            'bold',
            'italic',
            'bulletedList',
            'numberedList',
            '|',
            'undo',
            'redo',
          ],
        },
      };
    }
  }

  _issueId: string;

  @Input()
  set issueId(val: string) {
    this.loading = true;
    this._issueId = val;
    if (this._issueId) {
      this.issueService.getIssue(this._issueId).subscribe(
        (issue: Issue) => {
          this.issue = issue;
          this.currentDraft = this.issue.getCurrentDraft();
          if (this.issue.invoice) {
            this.dueDate = this.issue.invoice.dueDate;
            this.invoiceDiscount = this.issue.invoice.invoiceDiscount;
            this.notes = this.issue.invoice.notes;
          }
          this.publicationService
            .getPublicationPreview(issue.publicationId)
            .subscribe((preview) => {
              this.publicationPreview = preview;
              this.fundraisingService
                .getDonations(this.issue.publicationId)
                .subscribe(
                  (donations) => {
                    this.donations = donations;
                    this.customerAccountService
                      .checkAvailableFunds(this.issue.publicationId)
                      .subscribe((data) => {
                        this.publication = new Publication().deserialize(
                          data.data
                        );
                        this.fundraisingService
                          .getSubscriptions(this.publication.id)
                          .subscribe(
                            async (subscriptions) => {
                              console.log(subscriptions);
                              this.subscriptions = subscriptions;
                              this.setTotalAvailable();
                              this.createFormShipping();
                              this.createFormPricing();
                              this.createFormPayment();
                              this.setActiveTab();
                              await this.setShowAddCommentSection();
                              this.setShowFormShipping();
                              this.setShowFormPricing();
                              this.setShowFormPayment();
                              this.setShowFormConfirmPayment();
                              this.loadReport();
                              this.loadMembers();
                              this.loading = false;
                            },
                            (errorData) => {
                              console.log('Error: ', errorData);
                            }
                          );
                      });
                  },
                  (errorData) => {
                    console.log('Error: ', errorData);
                  }
                );
            });
        },
        () => {
          this.router.navigate(['/admin']);
        }
      );
    }
  }

  _showPopup = false;

  @Input()
  set showPopup(val: boolean) {
    this._showPopup = val;
    if (this._showPopup) {
      this.showAddCommentSection = false;
      this.popupClass = 'modal-show';
      this.pageService.addBodyClass('modal-open');
    } else {
      this.popupClass = '';
      this.pageService.removeBodyClass('modal-open');
    }
  }

  _selectedTab: number;

  @Input()
  set selectedTab(val: number) {
    this._selectedTab = 0;
    if (val) {
      this._selectedTab = val;
    }
  }

  ngOnInit() {
    this.role = role;
  }

  setTotalAvailable() {
    this.totalAvailable =
      (this.publication.availableFunds &&
        this.publication.availableFunds.totalAvailable) ||
      0;
  }

  showSummaryAvailableFunds() {
    const modalRef = this.dialog.open(this.availableFundsSummaryPopup, { panelClass: ['flat-dialog', 'width-700'] });
    // modalRef.componentInstance.availableFunds = this.publication.availableFunds;
    // modalRef.componentInstance.totalAvailable = this.totalAvailable;
  }


  calculateTotals() {
    // const chargeAmount = Math.ceil(flatAmount + chargeFee);
    const percentageFee = 0.035;
    const flatFee = 0.3;
    this.flatAmount =
      parseFloat(this.pricingForm.get('price').value) +
      parseFloat(this.pricingForm.get('shipping').value) +
      parseFloat(this.pricingForm.get('tax').value) -
      parseFloat(this.pricingForm.get('discount').value) -
      parseFloat(this.pricingForm.get('invoiceDiscount').value);
    this.fee = round(this.flatAmount * percentageFee + flatFee, 2);
    this.chargeAmount = round(this.flatAmount + this.fee, 2);
  }

  closePopup(issue = null) {
    this._showPopup = false;
    this.popupClass = '';
    this.pageService.addBodyClass('modal-open');
    this.popupEvent.emit({ type: 'popup.closed', issue: issue });
    this.commentObj = {
      msg: '',
      status: '',
    };
  }

  showStatus(status) {
    return issueStatus.getStatusStrAdmin(status);
  }

  downloadFile() {
    if (this.isBrowser) {
      this.draftService.downloadPdf(this.currentDraft.filePublicUrl).subscribe(
        (data) => {
          const blob = new Blob([data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);

          const link = this.downloadPdfLink.nativeElement;
          link.href = url;
          link.download =
            this.issue.publicationName + '-#' + this.issue.number + '.pdf';
          link.click();

          window.URL.revokeObjectURL(url);
        },
        (errorData) => {
          let error = 'Error Downloading File';
          const errorApi = this.alertService.errorApiToString(errorData, '');
          if (errorApi) {
            error += ': ' + errorApi;
          }
          this.alertService.showAlertDanger(error);
        }
      );
    }
  }

  downloadInvoice() {
    if (this.isBrowser) {
      this.draftService.downloadPdf(this.issue.invoice.filePublicUrl).subscribe(
        (data) => {
          const blob = new Blob([data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);

          const link = this.downloadInvoiceLink.nativeElement;
          link.href = url;
          link.download =
            `Invoice-${ this.issue.publicationName }#${ this.issue.number }` +
            '.pdf';
          link.click();

          window.URL.revokeObjectURL(url);
        },
        (errorData) => {
          let error = 'Error Downloading File';
          const errorApi = this.alertService.errorApiToString(errorData, '');
          if (errorApi) {
            error += ': ' + errorApi;
          }
          this.alertService.showAlertDanger(error);
        }
      );
    }
  }

  submitReviewForm() {
    const selectedStatus = this.commentObj.status,
      msg = this.commentObj.msg;

    if (selectedStatus === issueStatus.draftAccepted) {
      this.draftService.acceptDraft(this.currentDraft.id, msg).subscribe(
        (issue) => {
          this.alertService.showAlertSuccess('Changes saved.');
          this.closePopup(issue);
        },
        (errorData) => {
          this.alertService.showAlertDangerApiError(errorData);
        }
      );
    } else if (selectedStatus === issueStatus.draftRejected) {
      this.draftService.rejectDraft(this.currentDraft.id, msg).subscribe(
        (issue) => {
          this.alertService.showAlertSuccess('Changes saved.');
          this.closePopup(issue);
        },
        (errorData) => {
          this.alertService.showAlertDangerApiError(errorData);
        }
      );
    } else if (selectedStatus === 'sendFeedback') {
      this.draftService
        .addFeedback(this.issue.getCurrentDraft().id, msg)
        .subscribe(
          (feedback) => {
            this.alertService.showAlertSuccess('Feedback sent!.');
            this.closePopup(this.issue);
          },
          (errorData) => {
            this.alertService.showAlertDangerApiError(errorData);
          }
        );
    } else if (selectedStatus === issueStatus.draftSubmittedForPrintSchedule) {
      if (this.issue.addressIds) {
        this.draftService.submitForPrint(this.issue, this.issue.addressIds).subscribe(
          (issue) => {
            this.alertService.showAlertSuccess('Changes saved.');
            this.closePopup(issue);
          },
          (errorData) => {
            this.alertService.showAlertDangerApiError(errorData);
          }
        );
      } else {
        this.alertService.showAlertDanger(
          // tslint:disable: no-trailing-whitespace
          `Shipping Addresses are missing in this issue.
          This issue surely was created through the onboarding process,
          which skips adding the shipping addresses info.`
        );
        // tslint:enable: no-trailing-whitespace
      }
    }
  }

  submitShippingForm() {
    const selectedStatus = this.shippingForm.get('status').value;

    if (selectedStatus === issueStatus.issueShipped) {
      if (this.shippingForm.valid) {
        this.draftService
          .shipped(
            this.issue.getCurrentDraft().id,
            this.shippingForm.get('trackingUrl').value
          )
          .subscribe(
            (issue) => {
              this.alertService.showAlertSuccess('Changes saved.');
              this.closePopup(issue);
            },
            (errorData) => {
              this.alertService.showAlertDangerApiError(errorData);
            }
          );
      } else {
        this.formUtil.validateAllFormFields(this.shippingForm);
      }
    } else if (selectedStatus === issueStatus.issueDelivered) {
      this.draftService.delivered(this.issue.getCurrentDraft().id).subscribe(
        (issue) => {
          this.alertService.showAlertSuccess('Changes saved.');
          this.closePopup(issue);
        },
        (errorData) => {
          this.alertService.showAlertDangerApiError(errorData);
        }
      );
    }
  }

  onChangeStatusShipping(currentStatus: string) {
    if (currentStatus === issueStatus.issueDelivered) {
      this.shippingForm.get('trackingUrl').disable();
    } else {
      this.shippingForm.get('trackingUrl').enable();
    }
  }

  onChangeStatusPricing(currentStatus: string) {
    if (currentStatus === issueStatus.issueDelivered) {
      this.pricingForm.get('trackingUrl').disable();
    } else {
      this.pricingForm.get('trackingUrl').enable();
    }
  }

  submitPaymentForm() {
    if (this.paymentForm.valid) {
      this.paymentInfo.data = this.paymentInfo.getChargeData();
      const method = this.paymentInfo.paymentType;
      this.draftService
        .changePaymentMethod(this.issue.getCurrentDraft().id, {
          ...this.paymentInfo.data,
          type: 'StandardCharge',
          method: method,
        })
        .subscribe(
          (newIssue: Issue) => {
            this.issue = newIssue;
            this.closePopup(newIssue);
            this.alertService.showAlertSuccess(
              'Payment method changed successfully!'
            );
          },
          (errorData: any) => {
            this.alertService.showAlertDangerApiError(errorData);
          }
        );
    } else {
      this.formUtil.validateAllFormFields(this.paymentForm);
      this.alertService.showAlertDanger(
        'One or more fields have an error. Please check and try again.'
      );
    }
  }

  setPricingData() {
    const data = { shipping: 0, price: 0, tax: 0, discount: 0 };
    if (this.pricingForm.valid) {
      data.shipping = parseFloat(this.pricingForm.value.shipping);
      data.price = parseFloat(this.pricingForm.value.price);
      data.tax = parseFloat(this.pricingForm.value.tax);
      data.discount = parseFloat(this.pricingForm.value.discount);
      console.log(data);
      return data;
    } else {
      this.formUtil.validateAllFormFields(this.pricingForm);
      this.alertService.showAlertDanger(
        'One or more fields have an error. Please check and try again.'
      );
    }
  }

  submitPricingForm() {
    this.setPricingDetailsObs().subscribe(
      (newIssue: Issue) => {
        this.issue = newIssue;
        this.closePopup(newIssue);
        this.alertService.showAlertSuccess('Pricing changed successfully!');
      },
      (errorData: any) => {
        this.alertService.showAlertDangerApiError(errorData);
      }
    );
  }

  setPricingDetailsObs() {
    const data = this.setPricingData();
    return this.draftService.setPricingDetails(
      this.issue.getCurrentDraft().id,
      { ...data, isStripe: false }
    );
  }

  confirmPayment() {
    this.draftService.confirmPayment(this.issue.getCurrentDraft().id).subscribe(
      (newIssue: Issue) => {
        this.issue = newIssue;
        this.closePopup(newIssue);
        this.alertService.showAlertSuccess('Payment confirmed successfully!');
      },
      (errorData: any) => {
        this.alertService.showAlertDangerApiError(errorData);
      }
    );
  }

  sendInvoice($event) {
    $event.preventDefault();
    $event.stopPropagation();

    if (!this.dueDate) {
      this.alertService.showAlertDanger(
        'You must define due date for the invoice!'
      );
      return;
    }

    this.dialog
      .open(this.dialogConfirmInvoiceSend, { panelClass: 'confirm-dialog' })
      .afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe((result) => {
        if (result) {
          if (this.pricingForm.valid) {
            this.setPricingDetailsObs().subscribe(
              (newIssue: any) => {
                const pricingData = this.setPricingData();
                const invoiceData = {
                  pricingData: pricingData,
                  dueDate: this.dueDate,
                  invoiceDiscount: this.pricingForm.get('invoiceDiscount')
                    .value,
                  notes: this.pricingForm.get('notes').value,
                  billTo: this.pricingForm.get('billTo').value,
                };
                console.log(invoiceData);
                this.issueService
                  .sendInvoiceMail(this.issue.id, invoiceData)
                  .subscribe(
                    () => {
                      this.alertService.showAlertSuccess(
                        'Invoice sent successfully!'
                      );
                      this.issueService
                        .getIssue(this._issueId)
                        .subscribe((issue: Issue) => {
                          this.issue = issue;
                          this.closePopup(issue);
                        });
                    },
                    (errorData: any) => {
                      this.alertService.showAlertDangerApiError(errorData);
                    }
                  );
              },
              (errorData: any) => {
                this.alertService.showAlertDangerApiError(errorData);
              }
            );
          } else {
            this.formUtil.validateAllFormFields(this.pricingForm);
            this.alertService.showAlertDanger(
              'One or more fields have an error. Please check and try again.'
            );
          }
        }
      });
  }

  previewInvoice($event) {
    if (this.pricingForm.invalid) {
      this.formUtil.validateAllFormFields(this.pricingForm);
      this.alertService.showAlertDanger(
        'One or more fields have an error. Please check and try again.'
      );
      return;
    }
    const pricingData = this.setPricingData();
    const invoiceData = {
      pricingData: pricingData,
      dueDate: this.dueDate,
      invoiceDiscount: this.pricingForm.get('invoiceDiscount')
        .value,
      notes: this.pricingForm.get('notes').value,
      billTo: this.pricingForm.get('billTo').value,
    };
    this.issueService
      .previewInvoice(this.issue.id, invoiceData)
      .subscribe(
        (data: any) => {
          console.log(data);
          // const blob = new Blob([data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(data);
          saveAs(data, `Invoice-${ this.publication.name }#${ this.issue.number }.pdf`);
          window.URL.revokeObjectURL(url);
        },
        (errorData: any) => {
          this.alertService.showAlertDangerApiError(errorData);
        }
      );
  }

  addDate(type: string, event: MatDatepickerInputEvent<Date>): void {
    console.log(event);
    this.dueDate = event.value;
  }

  mailingAddressComplete() {
    //
  }

  dynamicDownloadTxt() {
    this.draftService.extractTextFromDraft(this.currentDraft.id).subscribe(
      (data) => {
        this.dynamicDownloadByHtmlTag({
          fileName: this.issue.publicationName + '-#' + this.issue.number,
          text: data.data,
        });
      },
      (errorData) => {
        console.log('Error: ', errorData);
      }
    );
  }

  openPdf() {
    this.http.head(this.publicationPreview.fileUrl).subscribe(
      (data) => {
        this.clickedCover = {
          downloadUrl: this.publicationPreview.downloadUrl,
          fileUrl: this.publicationPreview.fileUrl
        };
        this.pdfViewerService.showPdf(this.clickedCover);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  markInvoiceAsPaid($event) {
    $event.preventDefault();
    $event.stopPropagation();

    this.dialog
      .open(this.dialogConfirmMarkInvoiceAsPaid, {
        panelClass: 'confirm-dialog',
      })
      .afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe((result) => {
        this.issueService.markInvoiceAsPaid(this.issue.id).subscribe(
          (res: { issue: Issue; invoice: Invoice }) => {
            this.issueService
              .getIssue(this._issueId)
              .subscribe((issue: Issue) => {
                this.issue = issue;
                this.closePopup(issue);
              });
            this.alertService.showAlertSuccess(
              'Invoice marked as paid successfully!'
            );
          },
          (errorData: any) => {
            this.alertService.showAlertDangerApiError(errorData);
          }
        );
      });
  }

  sendDueReminder($event) {
    $event.preventDefault();
    $event.stopPropagation();

    this.dialog
      .open(this.dialogConfirmSendDueReminder, { panelClass: 'confirm-dialog' })
      .afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.issueService.sendInvoiceReminder(this.issue.id).subscribe(
          () => {
            this.alertService.showAlertSuccess(
              'Invoice reminder sent successfully!'
            );
          },
          (errorData: any) => {
            this.alertService.showAlertDangerApiError(errorData);
          }
        );
      });
  }

  ngOnDestroy() {
  }

  private createFormShipping() {
    this.shippingForm = new FormGroup({
      trackingUrl: new FormControl(this.issue.trackingUrl, [
        Validators.pattern(
          /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/
        ),
      ]),
      status: new FormControl(this.issue.status),
    });
  }

  private createFormPricing() {
    console.log(this.publicationPreview, this.issue);
    this.pricingForm = new FormGroup({
      billTo: new FormControl(
        this.issue.invoice && this.issue.invoice.billTo ? this.issue.invoice.billTo : this.publicationPreview.managingEditorName,
        [Validators.required]
      ),
      price: new FormControl(
        this.issue.pricingRequest ? this.issue.pricingRequest.price : 0
      ),
      shipping: new FormControl(
        this.issue.pricingRequest ? this.issue.pricingRequest.shipping : 0
      ),
      tax: new FormControl(
        this.issue.pricingRequest ? this.issue.pricingRequest.tax : 0
      ),
      discount: new FormControl(
        this.issue.pricingRequest ? this.issue.pricingRequest.discount : 0,
        [Validators.max(this.totalAvailable)]
      ),
      dueDate: new FormControl(
        this.issue.invoice ? this.issue.invoice.dueDate : '',
        [Validators.required]
      ),
      invoiceDiscount: new FormControl(
        this.invoiceDiscount ? this.invoiceDiscount : 0
      ),
      notes: new FormControl(this.notes ? this.notes : ''),
    });
    if (this.issue.invoice && this.issue.invoice.status === 'paid') {
      this.pricingForm.disable();
    }
    this.calculateTotals();
  }

  private createFormPayment() {
    this.paymentForm = new FormGroup({});
  }

  private async setShowAddCommentSection() {
    this.showAddCommentSection = false;
    this.hasComments = false;
    this.feedbackArr = [];
    this.statusList = [];

    this.feedbackArr = await this.draftService.getDraftFeedbackArr2(this.issue);
    this.hasComments = this.feedbackArr.length > 0;

    // console.log('feedbackArr', this.feedbackArr);

    if (
      this.issue.status !== issueStatus.issueCreated &&
      this.issue.status !== issueStatus.printingDataConfirmed
    ) {
      this.showAddCommentSection = true;
    }
    // console.log(this.issue);

    this.statusList.push({ id: 'sendFeedback', value: 'Send Feedback' });
    if (
      this.issue.status === issueStatus.draftSubmittedForReview ||
      this.issue.status === issueStatus.draftInReview ||
      this.issue.status === issueStatus.draftRejected
    ) {
      this.statusList.push({
        id: issueStatus.draftAccepted,
        value: this.showStatus(issueStatus.draftAccepted),
      });
      this.statusList.push({
        id: issueStatus.draftRejected,
        value: this.showStatus(issueStatus.draftRejected),
      });
    }

    if (this.issue.status === issueStatus.draftAccepted) {
      this.statusList.push({
        id: issueStatus.draftSubmittedForPrintSchedule,
        value: this.showStatus(issueStatus.draftSubmittedForPrintSchedule),
      });
    }

    if (this.issue.status === issueStatus.draftSubmittedForReview) {
      this.draftService
        .markInReview(this.currentDraft.id)
        .subscribe((issue) => {
          this.issue.status = issue.status;
          this.popupEvent.emit({ type: 'popup.issueUpdated', issue: issue });
        });
    }

    // this.issue.publicationIssueStatusTracking.forEach(track => {
    //   // if (track.notes && track.notes !== '') {
    //   //   this.hasComments = true;
    //   // }
    // });
  }

  private setShowFormShipping() {
    this.showFormShipping = false;

    if (!this.issue.getCurrentDraft()) {
      return;
    }

    if (
      this.issue.status === issueStatus.paymentSubmitted ||
      this.issue.status === issueStatus.issueShipped ||
      this.issue.status === issueStatus.issueDelivered
    ) {
      this.showFormShipping = true;
    }

    if (this.issue.status === issueStatus.issueDelivered) {
      this.shippingForm.get('trackingUrl').disable();
    }

    if (this.showFormShipping) {
      this.statusList = [];
      this.statusList.push({
        id: issueStatus.issueShipped,
        value: this.showStatus(issueStatus.issueShipped),
      });
      this.statusList.push({
        id: issueStatus.issueDelivered,
        value: this.showStatus(issueStatus.issueDelivered),
      });
    }
  }

  private setActiveTab() {
    this.activeTab = 0;
    if (
      this.issue.status === issueStatus.draftSubmittedForPrintSchedule ||
      this.issue.status === issueStatus.issueShipped ||
      this.issue.status === issueStatus.issueDelivered
    ) {
      this.activeTab = 1;
    }
  }

  private setShowFormPricing() {
    this.showFormPricing = false;

    if (!this.issue.getCurrentDraft()) {
      return;
    }

    if (
      this.issue.status === issueStatus.draftAccepted ||
      this.issue.status === issueStatus.pricingConfirmed ||
      this.issue.status === issueStatus.pricingInReview
    ) {
      this.showFormPricing = true;
      switch (this.issue.status) {
        case issueStatus.pricingInReview:
          this.btnPaymentLabel = 'Enable Payment';
          break;
        default:
          this.btnPaymentLabel = 'Save';
          break;
      }
    }
  }

  private setShowFormPayment() {
    this.showFormPayment = false;

    if (!this.issue.getCurrentDraft() || (this.issue.invoice && this.issue.invoice.status === 'paid')) {
      return;
    }

    if (this.issue.status === issueStatus.pricingConfirmed) {
      this.showFormPayment = true;
    }

    if (this.issue.status === issueStatus.paymentSubmitted) {
      this.showPaymentInfo = true;
    }
  }

  private setShowFormConfirmPayment() {
    this.showFormConfirmPayment = false;

    if (!this.issue.getCurrentDraft()) {
      return;
    }

    if (
      this.issue.status === issueStatus.pricingConfirmed &&
      this.issue.paymentMethod.type
    ) {
      this.showFormConfirmPayment = true;
    }
  }

  private loadReport() {
    this.loading = true;
    this.fundraisingService.getDonations(this.issue.publicationId).subscribe(
      (donations) => {
        this.donations = donations;
      },
      (errorData) => {
        console.log('Error: ', errorData);
      }
    );
  }

  private dynamicDownloadByHtmlTag(arg: { fileName: string; text: string }) {
    if (!this.setting.element.dynamicDownload && this.isBrowser) {
      this.setting.element.dynamicDownload = document.createElement('a');
    }
    const element = this.setting.element.dynamicDownload;
    element.setAttribute(
      'href',
      `data:text/plain;charset=utf-8,${ encodeURIComponent(arg.text) }`
    );
    element.setAttribute('download', arg.fileName);

    const event = new MouseEvent('click');
    element.dispatchEvent(event);
  }

  private loadMembers() {
    this.members = [];
    this.loadingMembers = true;
    this.memberService
      .getMembers(this.issue.publicationId)
      .subscribe((members) => {
        this.members = members;
        // console.log(this.members, this.currentDraft);
        this.loadingMembers = false;
      });
  }
}
