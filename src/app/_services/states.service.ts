import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatesService {
  constructor(private http: HttpClient) { }
  public getStates(): Observable<any> {
    return this.http.get('./assets/data/states.json');
  }
}
