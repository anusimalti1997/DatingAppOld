import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Member } from '../_modals/member';
import { map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  members: Member[] = [];
  baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getMembers() {
    if (this.members.length > 0) {
      return of(this.members)
    }
    return this.http.get<Member[]>(this.baseUrl + 'Users').pipe(map(
      member => {
        this.members = member;
        return member;
      }
    ))
  }

  getMember(username: string) {
    if (this.members.length > 0) {
      const member = this.members.find(x => x.userName === username);
      return of(member)
    } else {
      return this.http.get<Member>(this.baseUrl + 'Users/' + username)
    }
  }

  updateMember(member: Member) {

    return this.http.put(this.baseUrl + 'Users', member).pipe(
      map(() => {
        const index = this.members.indexOf(member)
        this.members[index] = { ...this.members[index], ...member }
      })
    )
  }

  setMainPhoto(photoId: number) {
    return this.http.put(this.baseUrl + 'Users/set-main-photo/' + photoId, {})
  }
  deletePhoto(photoId: number) {
    return this.http.delete(this.baseUrl + 'Users/delete-photo/' + photoId, {})
  }

  // getHttpOptions() {
  //   const userString = localStorage.getItem('user');
  //   if (!userString) {
  //     return;
  //   }
  //   const user = JSON.parse(userString);
  //   return {
  //     headers: new HttpHeaders({
  //       Authorization: 'Bearer ' + user.token
  //     })
  //   }
  // }


}
