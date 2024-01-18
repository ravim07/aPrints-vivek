import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { Invitation } from '_models';
import { Publication } from '_models/publication.model';

@Injectable({
  providedIn: 'root'
})
export class InvitationService {

  constructor(private http: HttpClient, private apiService: ApiService) {}

  sendInvitationManagingEditor(data: any) {
    return this.http.post<any>(this.apiService.getApiUrl('Invites/inviteManagingEditor'), data).pipe(
      map(invite => invite = new Invitation().deserialize(invite.data)),
      catchError(this.apiService.formatErrors)
    );
  }

  sendInvitationEditorialStaff(data: any) {
    return this.http.post<any>(this.apiService.getApiUrl('Invites/inviteEditorialStaff'), data).pipe(
      map(invite => invite = new Invitation().deserialize(invite.data)),
      catchError(this.apiService.formatErrors)
    );
  }

  sendInvitationContributor(data: any) {
    return this.http.post<any>(this.apiService.getApiUrl('Invites/inviteContributor'), data).pipe(
      map(invite => invite = new Invitation().deserialize(invite.data)),
      catchError(this.apiService.formatErrors)
    );
  }

  findAndCheckIfValid(token: string): Observable<Invitation> {
    const data = {token: token};

    return this.http.post<any>(this.apiService.getApiUrl('Invites/findAndCheckIfValid'), data).pipe(
      map(invite => invite = new Invitation().deserialize(invite.data)),
      catchError(this.apiService.formatErrors)
    );
  }

  acceptInvitation(invitationToken: string): Observable<Publication> {
    const inData = {token: invitationToken};

    return this.http.post<any>(this.apiService.getApiUrl('Invites/accept'), inData).pipe(
      mergeMap(data => {
        data = new Invitation().deserialize(data.data);
        return this.http.get<Publication>(this.apiService.getApiUrl('Publications/' + data.inviteTargetId));
      }),
      map(data => {
        const pub = new Publication().deserialize(data);
        return pub;
      }),
      catchError(this.apiService.formatErrors)
    );
  }

  acceptReferral(invitationToken: string): Observable<Invitation> {
    const inData = {token: invitationToken};

    return this.http.post<any>(this.apiService.getApiUrl('Invites/accept'), inData).pipe(
      map(data => {
        const inv = new Invitation().deserialize(data.data);
        return inv;
      }),
      catchError(this.apiService.formatErrors)
    );
  }

  getPendingInvites(pubId: string): Observable<Invitation[]> {
    return this.http.get<any>(this.apiService.getApiUrl('Publications/' + pubId + '/listMemberPendingInvitations')).pipe(
      map(data => {
        return this.processPendingInvitations(data);
      }),
      catchError(this.apiService.formatErrors)
    );
  }

  getPendingContributorInvites(pubId: string): Observable<Invitation[]> {
    return this.http.get<any>(this.apiService.getApiUrl('Publications/' + pubId + '/listMemberPendingInvitations')).pipe(
      map(data => {
        return this.processPendingInvitations(data, ['contributor']);
      }),
      catchError(this.apiService.formatErrors)
    );
  }

  newReferral(data: any) {
    return this.http.post<any>(this.apiService.getApiUrl('Invites/newReferral'), data).pipe(
      map(invite => invite = new Invitation().deserialize(invite.data)),
      catchError(this.apiService.formatErrors)
    );
  }

  private processPendingInvitations(invitationList: any, filter?: [string]): Invitation[] {
    // console.log(invitationList);
    const invitation = [];
    let inviteObj;
    invitationList.data.results.forEach(member => {
      if (!filter || filter.indexOf(member.inviteType) > -1) {
        inviteObj = new Invitation().deserialize(member);
        invitation.push(inviteObj);
      }
    });
    return invitation;
  }

  listReferrals(filter: string = ''): Observable<any> {
    return this.http.get<any>(this.apiService.getApiUrl(`Invites/listReferrals?${filter}`)).pipe(
      map(data => data.data),
      catchError(this.apiService.formatErrors)
    );
  }

}
