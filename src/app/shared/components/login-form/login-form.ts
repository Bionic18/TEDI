import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
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

  errorMessage = signal('');
  isSubmitting = signal(false);

  save(): void {
    this.errorMessage.set('');
    this.isSubmitting.set(true);

    this.authService.login(this.username, this.password).subscribe({
      next: (user) => {
        console.log('Logged in as:', user);

        this.errorMessage.set('');
        this.isSubmitting.set(false);
        this.loginSuccess.emit();
      },
      error: (err) => {
        console.error('Login failed', err);

        this.errorMessage.set('Invalid username or password.');
        this.isSubmitting.set(false);
      },
    });
  }
}
