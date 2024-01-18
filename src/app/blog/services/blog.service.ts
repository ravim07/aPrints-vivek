import { Injectable } from '@angular/core';
import { BlogModule } from '../blog.module';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';
import { BlogPostModel } from '../models/blog-post.model';

@Injectable({
  providedIn: BlogModule
})
export class BlogService {
  apiUrl;

  constructor(private http: HttpClient) {
    this.apiUrl = environment.blogApiUrl;
  }

  getPosts(perPage?: number) {
    const paramsObject: any = {};
    if (perPage) {
      paramsObject.per_page = perPage;
    }
    const params = new HttpParams({
      fromObject: paramsObject
    });
    return this.http.get(this.apiUrl + '/posts', { params })
      .pipe(map((posts: any[]) => posts.map(p => new BlogPostModel(p))));
  }


  getCategories(perPage?: number) {
    const paramsObject: any = {};
    if (perPage) {
      paramsObject.per_page = perPage;
    }
    const params = new HttpParams({
      fromObject: paramsObject
    });
    return this.http.get(this.apiUrl + '/categories', { params });
  }

}
