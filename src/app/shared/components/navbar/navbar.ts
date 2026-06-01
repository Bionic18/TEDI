import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  showLoginForm = false;
  changeShowLoginForm () {
    this.showLoginForm = !this.showLoginForm;
  }
}
