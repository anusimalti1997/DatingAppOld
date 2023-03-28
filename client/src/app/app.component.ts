import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { User } from './_modals/user';
import { AccountService } from './_services/account.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'client';
  showRegister: boolean = true;

  constructor(

    private accountservice: AccountService
  ) {

  }
  ngOnInit(): void {
    this.accountservice.currentUser$.subscribe(res => {
      if (res) {
        this.showRegister = false;
      } else {
        this.showRegister = true;
      }
    })

    this.setCurrentUser();


  }



  setCurrentUser() {
    const userString = localStorage.getItem('user');
    if (!userString) return;
    const user: User = JSON.parse(userString);
    this.accountservice.setCurrentUser(user);
  }


}
