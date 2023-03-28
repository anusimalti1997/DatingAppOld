import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-resgister',
  templateUrl: './resgister.component.html',
  styleUrls: ['./resgister.component.css']
})
export class ResgisterComponent implements OnInit {
  model: any = {}
  // @Input() usersFromHomeComponent: any
  @Output() cancelRegister = new EventEmitter();
  constructor(private accountService: AccountService) { }

  ngOnInit(): void {
  }


  register() {
    console.log(this.model)
    this.accountService.register(this.model).subscribe({
      next: () => {
        //console.log(response)
        //this.loggedIn = true;
        this.cancel();
      },
      error: error => console.log(error),
      complete: () => console.log('request has completed')
    })
  }

  cancel() {
    this.cancelRegister.emit(false);
  }


}
