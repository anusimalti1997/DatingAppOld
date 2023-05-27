import { Component, OnInit } from '@angular/core';
import { Observable, take } from 'rxjs';
import { Member } from 'src/app/_modals/member';
import { Pagination } from 'src/app/_modals/pagination';
import { User } from 'src/app/_modals/user';
import { UserParams } from 'src/app/_modals/userParams';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit {

  members$: Observable<Member[]> | undefined;

  members: Member[] | undefined;
  pagination: Pagination | undefined;
  userParams: UserParams | undefined;
  user: User | undefined;
  genderList = [
    { value: 'male', display: 'Males' },
    { value: 'female', display: 'Females' }
  ]


  constructor(
    private memberService: MembersService,
    private accountService: AccountService
  ) {

    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: user => {
        if (user) {
          this.user = user;
          this.userParams = new UserParams(user)
        }
      }
    })
  }

  ngOnInit(): void {
    //this.members$ = this.memberService.getMembers();
    this.loadMembers();
  }

  loadMembers() {
    if (!this.userParams) return;
    this.memberService.getMembers(this.userParams).subscribe({
      next: response => {
        if (response.result && response.result) {
          this.members = response.result;
          this.pagination = response.pagination;
        }
      }
    })
  }

  pageChanged(e: any) {
    debugger
    if (this.userParams && this.userParams.pageNumber) {

      this.userParams.pageNumber = e.page
      this.loadMembers()
    }
  }

  resetFilters() {
    if (this.user) {
      this.userParams = new UserParams(this.user)
      this.loadMembers()
    }
  }
}
