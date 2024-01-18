import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '_shared/shared.module';
import { BlogPostListComponent } from './components/blog-post-list/blog-post-list.component';
import { BlogPostComponent } from './components/blog-post/blog-post.component';


@NgModule({
  declarations: [BlogPostListComponent, BlogPostComponent],
  imports: [
    CommonModule,
    SharedModule,
  ],
  exports: [BlogPostListComponent]
})
export class BlogModule {
}
