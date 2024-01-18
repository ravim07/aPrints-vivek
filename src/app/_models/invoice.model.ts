import { Deserializable } from './deserializable.model';
import { MailingAddress } from './mailing-address.model';
import { Pricing } from './pricing.model';
import { Issue } from './issue.model';

export class Invoice implements Deserializable {
  id: string;
  numberId: string;
  issueId: string;
  issueNumber: string;
  dueDate: Date;
  createdAt: Date;
  publicationId: string;
  publicationName: string;
  publicationDescription: string;
  mailingAddress: MailingAddress;
  pricingRequest: Pricing;
  invoiceDiscount: number;
  billTo: string;
  notes: string;
  filePublicUrl: string;
  fileId: string;
  dueStatus: string;
  invoiceDaysUntilDue: number;
  status: string;
  totalDue: number;

  deserialize(input: any, issue?: Issue) {
    this.invoiceDiscount = 0;
    Object.assign(this, input);

    this.issueNumber = issue.number;

    this.invoiceDaysUntilDue = Math.ceil((new Date(this.dueDate).getTime() - Date.now()) / 86400000);
    this.dueStatus = this.invoiceDaysUntilDue < 0 ? 'overdue' : 'open';
    if (this.status === 'paid') {
      this.dueStatus = 'paid';
    }
    this.invoiceDaysUntilDue = Math.abs(this.invoiceDaysUntilDue);

    if (this.createdAt) {
      this.createdAt = new Date(this.createdAt);
    }
    if (this.dueDate) {
      this.dueDate = new Date(this.dueDate);
    }
    if (input.publication) {
      this.publicationId = input.publication.id;
      this.publicationName = input.publication.name;
      this.publicationDescription = input.publication.description;
    }
    if (input._pricingRequest) {
      this.pricingRequest = new Pricing().deserialize(input._pricingRequest);
      this.totalDue = this.pricingRequest.flatAmount - this.invoiceDiscount;
      delete input._pricingRequest;
    }
    this.mailingAddress = new MailingAddress().deserialize(input.mailingAddress);

    return this;
  }
}
