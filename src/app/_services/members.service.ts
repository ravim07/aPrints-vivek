import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Member } from '_models';
import { role as roleModel } from '../_models/role.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class MemberService {
  constructor(private http: HttpClient, private apiService: ApiService) {
  }

  getMembers(pubId: string): Observable<Member[]> {
    return this.http
      .get<any>(
        this.apiService.getApiUrl('Publications/' + pubId + '/listMembers')
      )
      .pipe(
        map((data) => {
          return this.processMembers(data, pubId);
        }),
        catchError(this.apiService.formatErrors)
      );
  }

  getContributors(pubId: string): Observable<Member[]> {
    return this.http
      .get<any>(
        this.apiService.getApiUrl('Publications/' + pubId + '/listContributors')
      )
      .pipe(
        map((data) => {
          return this.processMembers(data, pubId);
        }),
        catchError(this.apiService.formatErrors)
      );
  }

  deleteMember(
    publicationId: string,
    memberId: string,
    role: string
  ): Observable<any> {
    const options = {};
    options['body'] = {
      userId: memberId,
      roleName: role,
    };

    return this.http
      .request<any>(
        'delete',
        this.apiService.getApiUrl(
          'Publications/' + publicationId + '/removeMember'
        ),
        options
      )
      .pipe(catchError(this.apiService.formatErrors));
  }

  deleteInvitation(
    publicationId: string,
    invitationId: string,
  ): Observable<any> {
    const options = {};
    options['body'] = {
      invitationId: invitationId,
    };

    return this.http
      .request<any>(
        'delete',
        this.apiService.getApiUrl(
          'Publications/' + publicationId + '/removeInvitation'
        ),
        options
      )
      .pipe(catchError(this.apiService.formatErrors));
  }

  deleteContributor(publicationId: string, memberId: string): Observable<any> {
    const options = {};
    options['body'] = { userId: memberId };

    return this.http
      .request<any>(
        'delete',
        this.apiService.getApiUrl(
          'Publications/' + publicationId + '/removeContributor'
        ),
        options
      )
      .pipe(catchError(this.apiService.formatErrors));
  }

  saveMember(
    publicationId: string,
    memberId: string,
    prevRole: string,
    newRole: string
  ): Observable<any> {
    const data = {
      userId: memberId,
      prevRole: prevRole,
      newRole: newRole,
    };

    return this.http
      .post<any>(
        this.apiService.getApiUrl(
          'Publications/' + publicationId + '/editMember'
        ),
        data
      )
      .pipe(catchError(this.apiService.formatErrors));
  }

  private processMembers(membersList: any, pubId: string): Member[] {
    const members = [];

    const processRole = function (role) {
      let memberObj;
      if (membersList.data[role]) {
        const datesPerId = membersList.data[`${ role }DatesAdded`];
        membersList.data[role].forEach((member) => {
          member.publicationId = pubId;
          memberObj = new Member().deserialize(member);
          memberObj.role = role;
          if (datesPerId) {
            memberObj.assignDate(datesPerId);
          }
          if (memberObj.role === 'contributors') {
            memberObj.role = 'contributor';
          }
          if (memberObj.role === 'advertisers') {
            memberObj.role = 'advertiser';
          }
          memberObj.roleLiteral = roleModel.getStrRole(memberObj.role);
          memberObj.finishActionConfig(memberObj);
          members.push(memberObj);
        });
      }
    };

    processRole('managingEditor');
    processRole('editorialStaff');
    processRole('contributors');
    processRole('advertisers');

    if (membersList.data['owner']) {
      members.every((member) => {
        if (member.id === membersList.data['owner'].id) {
          member.owner = true;
          return false;
        }
        return true;
      });
    }
    return members;
  }
}
