import { Component, OnDestroy, OnInit } from '@angular/core';
import { VideoPopupComponent } from 'components/landing/video-popup/video-popup.component';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { MatDialog } from '@angular/material';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-how-to-page',
  templateUrl: './how-to-page.component.html',
  styleUrls: ['./how-to-page.component.scss']
})
export class HowToPageComponent implements OnInit, OnDestroy {
  topVideo = {
    youtubeId: 'U4fQscbRlqk',
  };
  assetsUrl = environment.assetsUrl;
  videoTutorials = [
    {
      title: 'Getting Started',
      description: `How to set up your publication`,
      videoData: {
        thumbnail: `${ this.assetsUrl }/how-to/thumbnails/get-started.png`,
        videoUrl: `${ this.assetsUrl }/how-to/videos/Get+Started.mp4`,
      },
      label: 'Marketing',
      labelClass: 'badge-warning',
      bg: '#D87F3D;',
      cl:'d2',
      co:'#fff'
    },
    {
      title: 'Forming your Editorial Staff',
      description: `How to add new members to your editorial staff`,
      videoData: {
        thumbnail: `${ this.assetsUrl }/how-to/thumbnails/add-new-member.png`,
        videoUrl: `${ this.assetsUrl }/how-to/videos/Add+New+Member.mp4`,
      },
      label: 'Users',
      labelClass: 'badge-purple',
      bg: '#94C6BA;',
      cl:'d3',
      co:'#414968'
    },
    // {
    //   title: 'Collaborating on Content',
    //   description: `How to crowd source articles from your community`,
    //   videoData: {
    //     thumbnail: `${ this.assetsUrl }/how-to/thumbnails/collaborate.png`,
    //     videoUrl: `${ this.assetsUrl }/how-to/videos/Collaborate.mp4`,
    //   },
    //   label: 'Extension',
    //   labelClass: 'badge-dark',
    //   bg: '#E7E0C3;'
    // },
    {
      title: 'Submitting Articles for Publishing',
      description: `How to submit articles to the publication`,
      videoData: {
        thumbnail: `${ this.assetsUrl }/how-to/thumbnails/submit-article.png`,
        videoUrl: `${ this.assetsUrl }/how-to/videos/Submit+Article.mp4`,
      },
      label: 'Articles',
      labelClass: 'badge-primary',
      bg:  '#E7E0C3;',
      cl:'d4',
      co:'#414968' 
    },
    {
      title: 'Setting up Fund Raising',
      description: `How to set up fund raising types and levels`,
      videoData: {
        thumbnail: `${ this.assetsUrl }/how-to/thumbnails/fundraising.png`,
        videoUrl: `${ this.assetsUrl }/how-to/videos/Fundraising+v2.mp4`,
      },
      label: 'Fundraising',
      labelClass: 'badge-dark',
      bg: '#414968;',
      cl:'d5',
      co:'#fff'
    },
    {
      title: 'Executing Fundraising Drives',
      description: `How to conduct fund raising drives for your publication`,
      videoData: {
        thumbnail: `${ this.assetsUrl }/how-to/thumbnails/share-and-raise-funds.png`,
        videoUrl: `${ this.assetsUrl }/how-to/videos/Share+and+raise+funds+.mp4`,
      },
      label: 'Fundraising',
      labelClass: 'badge-purple',
      bg: ' #AD9438;',
      cl:'d6',
      co:'#fff'
    },
  ];

  constructor(private dialog: MatDialog) {
  }

  ngOnInit() {
  }

  videoPopup(videoData, type = 'video') {
    const dialogRef = this.dialog.open(VideoPopupComponent, {
      width: '100%',
      height: '85%',
      data: {
        videoUrl: videoData.videoUrl,
        type
      },
      panelClass: 'video-dialog',
    });

    dialogRef
      .afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe((result) => {
        console.log('The dialog was closed');
      });
  }

  ngOnDestroy() {
  }

}
