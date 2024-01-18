import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Review } from '_models';
import { ApiService } from '_services/api.service';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  constructor(private http: HttpClient, private apiService: ApiService) {}
  getAllReviews(): Observable<Review[]> {
    // return this.http.get(this.apiService.getApiUrl(`Reviews`)).pipe(
    //   tap(
    //     (data) => console.log('Got comments', data),
    //     (error) => console.error(error)
    //   ),
    //   map((reviews: any) => reviews.map((e) => new Review().deserialize(e)))
    // );
    return this.http.get("https://aprintis-api.herokuapp.com/api/Reviews").pipe(
          tap(
            (data) => console.log('Got comments', data),
            (error) => console.error(error)
          ),
          map((reviews: any) => reviews.map((e) => new Review().deserialize(e)))
        );
    
  }
}
