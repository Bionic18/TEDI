import {Component, inject} from '@angular/core';
import {AuthService} from '../../../core/services/auth-service';

@Component({
  selector: 'app-welcome-page',
  standalone: false,
  templateUrl: './welcome-page.html',
  styleUrl: './welcome-page.css',
})
export class WelcomePage {
  authService = inject(AuthService);

  changeShowLoginForm(): void {
    this.authService.showLoginForm = !this.authService.showLoginForm;
  }
}
