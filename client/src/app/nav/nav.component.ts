import { Component, OnInit } from '@angular/core';
import { AccountService } from '../_services/account.service';
@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  model: any = {};
  //loggedIn = false;
  constructor(
    public accountservice: AccountService
  ) { }

  ngOnInit(): void {

  }

  // getCurrentUser() {
  //   this.accountservice.currentUser$.subscribe({
  //     next: user => this.loggedIn = !!user,
  //     error: error => console.log(error)
  //   })
  // }

  login() {
    console.log(this.model)
    this.accountservice.login(this.model).subscribe({
      next: response => {
        console.log(response)
        //this.loggedIn = true;
      },
      error: error => console.log(error),
      complete: () => console.log('request has completed')
    })
  }

  logout() {
    //this.loggedIn = false;
    this.accountservice.logout();
  }
}
