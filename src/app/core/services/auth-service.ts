import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface AuthUser {
  id: number;
  username: string;
  roles: string[];
}

interface LoginResponse {
  access_token: string;
}

interface JwtPayload {
  sub: number;
  username: string;
  roles: string[];
  iat?: number;
  exp?: number;
}
export interface RegisterPayload {
  username: string;
  password: string;
  confirmPassword: string;

  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  address: string;
  city: string;
  country: string;

  latitude?: number | null;
  longitude?: number | null;

  afm: string;
}
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/auth';
  showLoginForm = false;

  currentUser = signal<AuthUser | null>(this.loadUserFromStoredToken());

  login(username: string, password: string): Observable<AuthUser | null> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/login`, {
        username,
        password,
      })
      .pipe(
        map((response) => {
          localStorage.setItem('access_token', response.access_token);

          const user = this.decodeUserFromToken(response.access_token);
          this.currentUser.set(user);

          return user;
        }),
      );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  hasRole(role: string): boolean {
    return this.currentUser()?.roles.includes(role) ?? false;
  }

  private loadUserFromStoredToken(): AuthUser | null {
    const token = localStorage.getItem('access_token');

    if (!token) {
      return null;
    }

    return this.decodeUserFromToken(token);
  }

  private decodeUserFromToken(token: string): AuthUser | null {
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson) as JwtPayload;

      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('access_token');
        return null;
      }

      return {
        id: payload.sub,
        username: payload.username,
        roles: payload.roles,
      };
    } catch (error) {
      console.error('Invalid JWT token', error);
      localStorage.removeItem('access_token');
      return null;
    }
  }
  register(payload: RegisterPayload): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/register`, payload);
  }
}
