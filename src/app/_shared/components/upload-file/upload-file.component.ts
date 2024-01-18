import { HttpEventType } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { Buffer } from 'buffer';
import { getDocument, PDFDocumentProxy } from 'pdfjs-dist';
import { throwError } from 'rxjs';
import { Draft } from '_models';
import { Issue } from '_models/issue.model';
import { UploadedFile } from '_models/uploaded-file.model';
import { DraftService } from '_services';
import { AlertService } from '_shared/services';

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.scss'],
})
export class UploadFileComponent {
  _openDialog: boolean;
  fileToUpload: File = null;

  @ViewChild('fileUpload', { static: false })
  fileInput: any;

  @Input()
  issue: Issue;

  @Output()
  fileUploaderEvent = new EventEmitter<any>();

  constructor(
    private draftService: DraftService,
    private alertService: AlertService
  ) {}

  @Input()
  set openDialog(val: boolean) {
    this._openDialog = val;
    if (this._openDialog) {
      this.fileInput.nativeElement.click();
    }
  }

  uploadFile() {
    this.fileUploaderEvent.emit({ type: 'uploader.uploadStarted' });
    this.draftService.uploadFileForDraft(this.fileToUpload).subscribe(
      (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          // console.log(event);
          if (event.total > 0) {
            this.fileUploaderEvent.emit({
              type: 'uploader.uploadProgress',
              percentage: (event.loaded * 100) / event.total,
            });
          }
        }
        if (event.type === HttpEventType.Response) {
          const file = new UploadedFile().deserialize(
            event.body.data.resultAPI
          );
          this.fileUploaderEvent.emit({
            type: 'uploader.fileUploaded',
            file: file,
          });
          this.fileUploaderEvent.emit({
            type: 'uploader.generatingThumbnail',
            file: file,
          });
          this.draftService.generateThumbnail(file.id).subscribe(
            (thumb) => {
              this.fileUploaderEvent.emit({
                type: 'uploader.thumbnailGenerated',
                file: thumb,
              });
              this.fileUploaderEvent.emit({ type: 'uploader.creatingDraft' });
              this.draftService.create(this.issue.id, file.id).subscribe(
                (d) => {
                  const draft = new Draft().deserialize(d);
                  this.fileUploaderEvent.emit({
                    type: 'uploader.draftCreated',
                    draft: draft,
                  });
                  this.resetFileInput();
                },
                (errorData) => {
                  const error =
                    'An error occurred creating draft, please try again later';
                  this.fileUploaderEvent.emit({
                    type: 'uploader.draftError',
                    error: error,
                  });
                  throw throwError(error);
                }
              );
            },
            (errorData) => {
              const error =
                'An error occurred generating thumbnail. Please check that your PDF is not bigger than 10MB.';
              this.fileUploaderEvent.emit({
                type: 'uploader.thumbnailError',
                error: error,
              });
              throw throwError(error);
            }
          );
        }
      },
      (errorData) => {
        let error = '';
        if (errorData.error && errorData.error.msg) {
          if (errorData.error && errorData.error.statusCode === 409) {
            error = 'Upload Failed. The file already exists on the server.';
          } else {
            error = errorData.error.msg;
          }
        } else {
          error = 'An error occurred uploading file, please try again later';
        }
        this.alertService.showAlertDanger(error);
        this.fileUploaderEvent.emit({
          type: 'uploader.onUploadError',
          error: error,
        });
        throw throwError(error);
      }
    );
  }

  onChangeUploadFile(files: FileList) {
    const fileItem = files.item(0);
    console.log(fileItem);
    if (fileItem.type.toLocaleLowerCase() !== 'application/pdf') {
      console.error('Invalid file type (' + fileItem.type + ')');
      this.alertService.showAlertDanger(
        'Invalid File Type. The file must be a PDF.'
      );
      this.resetFileInput();
    } else {
      this.fileToUpload = fileItem;
      this.uploadFile();
    }
  }

  extractFirstPageFromPDFasImage() {
    return new Promise((resolve, reject) => {
      try {
        const fileReader = new FileReader();
        fileReader.onload = async function (e: any) {
          const typedarray = new Uint8Array(e.target.result);
          const pdf: PDFDocumentProxy = await getDocument(typedarray).promise;
          console.log(pdf);
          const page = await pdf.getPage(1);
          console.log(page);
          const scale = 1.5;
          const canvas = document.createElement('canvas');
          const viewport = page.getViewport({ scale: scale });

          // Prepare canvas using PDF page dimensions
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          // Render PDF page into canvas context
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };
          const renderTask = await page.render(renderContext).promise;
          const img = canvas.toDataURL('image/png');
          const data = img.replace(/^data:image\/\w+;base64,/, '');
          const buf = Buffer.from(data, 'base64');
          resolve(buf);
          console.log(buf);
        };
        fileReader.readAsArrayBuffer(this.fileToUpload);
      } catch (error) {
        throw throwError(error);
      }
    });
  }

  resetFileInput() {
    this.fileInput.nativeElement.value = '';
  }
}
