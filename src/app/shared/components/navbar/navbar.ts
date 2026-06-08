import { Component,inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth-service';
import { UserRole} from '../../../core/models/users';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  authService = inject(AuthService);
  userRole = UserRole;
    showLoginForm = false;
  changeShowLoginForm () {
    this.showLoginForm = !this.showLoginForm;
  }
}
