import { Component, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { BlogService } from '../../services/blog.service';
import { BlogPostModel } from '../../models/blog-post.model';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-blog-post-list',
  templateUrl: './blog-post-list.component.html',
  styleUrls: ['./blog-post-list.component.scss']
})
export class BlogPostListComponent implements OnInit {
  posts: BlogPostModel[];
  filteredPosts: BlogPostModel[] = [];
  categories: any[];
  isMobile: boolean;
  isBrowser: boolean;

  constructor(private blogService: BlogService,
              @Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this.checkForMobile();
    this.getPosts();
    // this.getCategories();
  }

  getPosts() {
    this.blogService.getPosts(4).subscribe((result: any[]) => {
      this.posts = result;
      this.filterResults();
    });
  }

  getCategories() {
    this.blogService.getCategories().subscribe((result: any[]) => {
      this.categories = result;
    });
  }

  filterResults() {
    if (this.posts && this.posts.length) {
      const length = this.isMobile ? 4 : 3;
      this.filteredPosts = this.posts.slice(0, length);
    }
  }

  checkForMobile() {
    if (this.isBrowser) {
      this.isMobile = window.innerWidth < 1110;
    }
  }

  @HostListener('window:resize', ['$event'])
  windowResize($event) {
    this.checkForMobile();
    this.filterResults();
  }

}
