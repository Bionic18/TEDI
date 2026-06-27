import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  roles: string[];
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/users';

  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(this.baseUrl);
  }

  approveUser(id: number): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`${this.baseUrl}/${id}/approve`, {});
  }

  rejectUser(id: number): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`${this.baseUrl}/${id}/reject`, {});
  }
}
