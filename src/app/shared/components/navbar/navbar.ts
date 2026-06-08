import { Component,inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth-service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  authService = inject(AuthService);
  showLoginForm = false;
  changeShowLoginForm () {
    this.showLoginForm = !this.showLoginForm;
  }
}
