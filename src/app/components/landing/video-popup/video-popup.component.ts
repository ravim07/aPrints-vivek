import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-video-popup',
  templateUrl: './video-popup.component.html',
  styleUrls: ['./video-popup.component.scss']
})
export class VideoPopupComponent implements OnInit {

  @ViewChild('videoYoutube', { static: false }) video: any;
  videoSrc;

  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sanitizer: DomSanitizer) {
  }

  ngOnInit() {
    if (this.data.type === 'youtube') {
      this.generateYoutubeUrl();
    } else {
      this.videoSrc = this.data.videoUrl;
    }
  }

  generateYoutubeUrl() {
    const restUrl = '?autoplay=1&modestbranding=1&showinfo=0&color=white&rel=0&controls=1&rel=0';
    this.videoSrc = this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${ this.data.youtubeId }${ restUrl }`);
  }
}
