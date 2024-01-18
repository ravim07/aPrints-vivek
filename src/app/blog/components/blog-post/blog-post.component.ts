import { Component, Input, OnInit } from '@angular/core';
import { BlogPostModel } from '../../models/blog-post.model';

@Component({
  selector: 'app-blog-post',
  templateUrl: './blog-post.component.html',
  styleUrls: ['./blog-post.component.scss']
})
export class BlogPostComponent implements OnInit {
  @Input() post: BlogPostModel;

  constructor() {
  }

  ngOnInit() {
  }

}
