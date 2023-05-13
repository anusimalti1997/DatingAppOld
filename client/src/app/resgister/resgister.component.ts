import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../_services/account.service';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-resgister',
  templateUrl: './resgister.component.html',
  styleUrls: ['./resgister.component.css']
})
export class ResgisterComponent implements OnInit {
  model: any = {}
  registerForm: FormGroup = new FormGroup({});
  maxDate: Date = new Date();
  validationErrors: string[] | undefined;


  // @Input() usersFromHomeComponent: any
  @Output() cancelRegister = new EventEmitter();
  constructor(
    private accountService: AccountService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private router: Router,
    private datepipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.initializeForm()
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18)
  }



  initializeForm() {
    this.registerForm = this.fb.group({
      gender: ['male'],
      username: ['', Validators.required],
      knownAs: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]],
      confirmPassword: ['', [Validators.required, this.matchValues('password')]]

    });
    this.registerForm.controls['password'].valueChanges.subscribe({
      next: _ => {
        this.registerForm.controls['confirmPassword'].updateValueAndValidity()
      }
    })
  }

  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      return control.value === control.parent?.get(matchTo)?.value ? null : { notMatching: true }
    }
  }

  register() {

    let dob = this.datepipe.transform(this.registerForm.controls['dateOfBirth'].value, 'yyyy-MM-dd');

    let req = { ...this.registerForm.value, dateOfBirth: dob }

    console.log(req)
    this.accountService.register(req).subscribe({
      next: () => {
        this.toastr.success('Successfully registered')
        this.router.navigateByUrl('/members')
        //console.log(response)
        //this.loggedIn = true;
        //this.cancel();
      },
      error: error => {
        this.validationErrors = error
        //this.toastr.error(error.error)
      },
      complete: () => console.log('request has completed')
    })
  }

  cancel() {
    this.cancelRegister.emit(false);
  }


}
