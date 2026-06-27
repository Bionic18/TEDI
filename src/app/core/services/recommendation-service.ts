import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from '../models/events';

export interface RecommendationRequest {
  viewedEventIds: number[];
}

@Injectable({
  providedIn: 'root',
})
export class RecommendationService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/recommendations';

  getRecommendations(viewedEventIds: number[]): Observable<Event[]> {
    return this.http.post<Event[]>(this.baseUrl, {
      viewedEventIds,
    });
  }
}
