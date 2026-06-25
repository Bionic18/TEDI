import { Component, EventEmitter, inject, Output } from '@angular/core';
import { AuthService } from '../../../core/services/auth-service';

@Component({
  selector: 'app-login-form',
  standalone: false,
  templateUrl: './login-form.html',
  styleUrl: './login-form.css',
})
export class LoginForm {
  authService = inject(AuthService);
  @Output() loginSuccess = new EventEmitter<void>();

  username = '';
  password = '';
  errorMessage = '';

  save(): void {
    this.authService.login(this.username, this.password).subscribe({
      next: (user) => {
        console.log('Logged in as:', user);
        this.errorMessage = '';
        this.loginSuccess.emit();
      },
      error: (err) => {
        console.error('Login failed', err);
        this.errorMessage = 'Invalid username or password';
      },
    });
  }
}
