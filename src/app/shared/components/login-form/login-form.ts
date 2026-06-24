import { Component, inject } from '@angular/core';
import {AuthService} from '../../../core/services/auth-service';

@Component({
  selector: 'app-login-form',
  standalone: false,
  templateUrl: './login-form.html',
  styleUrl: './login-form.css',
})
export class LoginForm {
  authService = inject(AuthService);

  username = '';
  password = '';

  errorMessage = '';

  save(): void {
    this.authService.login(this.username, this.password).subscribe({
      next: (user) => {
        console.log('Logged in as:', user);
        this.errorMessage = '';
      },
      error: (err) => {
        console.error('Login failed', err);
        this.errorMessage = 'Invalid username or password';
      },
    });
  }
}
//TODO:make this disappear once it's clicked
