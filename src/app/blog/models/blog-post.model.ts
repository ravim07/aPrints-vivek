export class BlogPostModel {
  title: string;
  content: string;
  excerpt: string;
  link: string;
  date: Date;
  featured_media_url: string;

  constructor(data?: any) {
    // Object.assign(this, data);
    this.title = data.title.rendered;
    this.content = data.content.rendered;
    this.excerpt = data.excerpt.rendered;
    this.link = data.link;
    this.date = data.date;
    this.featured_media_url = data.jetpack_featured_media_url;
  }
}
