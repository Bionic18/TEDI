import { Component } from '@angular/core';

@Component({
  selector: 'app-login-form',
  standalone: false,
  templateUrl: './login-form.html',
  styleUrl: './login-form.css',
})
export class LoginForm {
    username ='';
    password = ''; // authenticate!!!!
  save(): void {
    console.log(this.username, this.password); //PLACEHOLDER
  }
}
