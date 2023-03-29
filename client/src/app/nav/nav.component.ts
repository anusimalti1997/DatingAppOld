import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '../_services/account.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  model: any = {};
  constructor(
    public accountservice: AccountService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {

  }



  login() {
    console.log(this.model)
    this.accountservice.login(this.model).subscribe({
      next: _ => {
        this.router.navigateByUrl('/members')
        this.toastr.success('Logged in successfully.')
      },
      error: error => this.toastr.error(error.error),
      complete: () => console.log('request has completed')
    })
  }

  logout() {
    this.accountservice.logout();
    this.router.navigateByUrl('/')
  }
}
