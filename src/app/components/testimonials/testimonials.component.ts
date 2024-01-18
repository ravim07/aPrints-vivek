import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { environment } from 'environments/environment';
import { Review } from '_models';
import { Observable, from } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ReviewService } from '_services';
import { ReviewDialogComponent } from 'components/landing/review-dialog.component';
import { untilDestroyed } from 'ngx-take-until-destroy';

@Component({
  selector: 'app-testimonials',
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.scss'],
  providers: [ReviewService]
})
export class TestimonialsComponent implements OnInit, OnDestroy {

  @ViewChild('videoYoutube', {static: false}) video: any;
  reviews$: Observable<Review[]>;
  cards: Review[];

  videoData = {
    youtubeId: 'U4fQscbRlqk',
    showVideo: false
  };

  assetsUrl = environment.assetsUrl;

  constructor(
    public dialog: MatDialog,
    private rs: ReviewService,
  ) { }

  ngOnInit() {
    this.initReviews();
  }

  setCardPadding(padding) {
    return { 'padding-top': 15 + 'px', 'padding-bottom': 15 + 'px' };
  }

  popup(data) {
    const dialogRef = this.dialog.open(ReviewDialogComponent, {
      width: '440px',
      data: data,
      panelClass: 'app-panel-review-dialog'
    });

    dialogRef.afterClosed().pipe(untilDestroyed(this)).subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  initReviews () {
    this.rs.getAllReviews().pipe(untilDestroyed(this)).subscribe(reviews => this.cards = reviews.reverse().splice(0, reviews.length - 2));
  }

  playVideo() {
    const videoSrc = 'https://www.youtube.com/embed/' + this.videoData.youtubeId +
      '?autoplay=1&modestbranding=1&showinfo=0&color=white&rel=0&controls=1&rel=0';
    this.video.nativeElement.src = videoSrc;
    setTimeout(() => {
      this.videoData.showVideo = true;
    }, 400);
  }

  ngOnDestroy() {}

}
