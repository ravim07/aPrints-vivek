import { CkeditorUploaderService } from '_services/ckeditor-uploader.service';

export class UploadAdapter {
  xhr: XMLHttpRequest;
  pendingUpload = [];
  genericErrorText = `Couldn't upload file: `;

  constructor(private loader,
              private ckeditorUploaderService: CkeditorUploaderService) {
    // The file loader instance to use during the upload.
  }

  // Starts the upload process.
  upload() {
    return this.loader.file
      .then(file => new Promise((resolve, reject) => {
        console.log('adapter upload started');
        this.ckeditorUploaderService.uploadNewFile(file, this.loader)
          .then(({ body }) => {
            console.log('response:', body);
            resolve({
              default: body.data.resultAPI.url
            });
          })
          .catch(response => {
            reject(response && response.error ?
              response.error.message :
              `${ this.genericErrorText } ${ file.name }.`);
          });


        /*          console.log('adapter base64');
                  this.stack.push(file);
                  this.ckeditorUploaderService.attachPendingFile(file);
                  console.log(this.stack, file);
                  const reader = new FileReader();
                  reader.onload = this._handleReaderLoaded.bind(this, resolve);
                  reader.readAsBinaryString(file);*/
      }));
  }

  // Aborts the upload process.
  abort() {
    if (this.xhr) {
      this.xhr.abort();
    }
  }

  /*async _handleReaderLoaded(readerEvt, resolve) {
    if (readerEvt.target) {
      const binaryString = readerEvt.target.result;
      const base64textString = btoa(binaryString);
      resolve({
        default: base64textString,
      });
    }
  }*/
}
