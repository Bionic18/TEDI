import { Injectable } from '@angular/core';
import {User, UserRole} from '../models/users';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  currentUser : User | null = null;

  logInAsRegistered() {
    this.currentUser = {
      username: 'Test Doe',
      role: UserRole.Registered
    }
  }

  logInAsAdmin() {
    this.currentUser = {
      username: 'Admin',
      role: UserRole.Admin
    }
  }

  logout() {
    this.currentUser = null;
  }
}
