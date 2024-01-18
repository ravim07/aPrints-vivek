import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '_services/api.service';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Address } from '_models/address.model';
import { Issue } from '_models/issue.model';

@Injectable({
  providedIn: 'root'
})
export class ShippingAddressService {

  constructor(private http: HttpClient, private apiService: ApiService) {
  }

  getPublicationShippingAddresses(pubId): Observable<Address[]> {
    return this.http.get(this.apiService.getApiUrl(`Publications/${ pubId }/addresses`))
      .pipe(map((data: any[]) => {
        return data.map(a => new Address().deserialize(a));
      }))
      .pipe(catchError(this.apiService.formatErrors));
  }

  createPublicationShippingAddress(pubId, address: any) {
    return this.http.post(this.apiService.getApiUrl(`Publications/${ pubId }/addresses`), address)
      .pipe(catchError(this.apiService.formatErrors));
  }

  deleteShippingAddress(addressId: any) {
    return this.http.delete(this.apiService.getApiUrl(`Addresses/${ addressId }`))
      .pipe(catchError(this.apiService.formatErrors));
  }

  updateShippingAddress(addressId: any, address: Address) {
    return this.http.patch(this.apiService.getApiUrl(`Addresses/${ addressId }`), address)
      .pipe(catchError(this.apiService.formatErrors));
  }

  createMultipleShippingAddresses(pubId, data: { addresses: Address[] }) {
    return this.http.post(this.apiService.getApiUrl(`Publications/${ pubId }/createMultipleAddresses`), data)
      .pipe(catchError(this.apiService.formatErrors));
  }

  issuesRelatedToAddress(addressId) {
    return this.http.get(this.apiService.getApiUrl(`Addresses/${ addressId }/issuesRelated`))
      .pipe(map((result: any) => {
        return result.data.map(a => new Issue
        ().deserialize(a));
      }))
      .pipe(catchError(this.apiService.formatErrors));
  }
}
