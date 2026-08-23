// src/app/services/review.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

export interface Review {
    _id: string;
    user_id: string;
    user_email: string;
    rating: number;
    comment: string;
    created_at: string;
    updated_at?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ReviewService {
    private apiUrl = 'http://127.0.0.1:8000/reviews';

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {}

    private getHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }

    createReview(propertyId: string, review: { rating: number; comment: string }): Observable<any> {
        return this.http.post(`${this.apiUrl}/${propertyId}`, review, {
            headers: this.getHeaders()
        });
    }

    getPropertyReviews(propertyId: string, limit: number = 10, skip: number = 0): Observable<any> {
        return this.http.get(`${this.apiUrl}/${propertyId}?limit=${limit}&skip=${skip}`);
    }

    getMyReviews(): Observable<Review[]> {
        return this.http.get<Review[]>(`${this.apiUrl}/my`, {
            headers: this.getHeaders()
        });
    }

    updateReview(reviewId: string, review: Partial<{ rating: number; comment: string }>): Observable<any> {
        if (!reviewId) {
            throw new Error('Review ID is required for update');
        }
        return this.http.put(`${this.apiUrl}/${reviewId}`, review, {
            headers: this.getHeaders()
        });
    }

    deleteReview(reviewId: string): Observable<any> {
        if (!reviewId || reviewId === 'undefined' || reviewId === 'null') {
            console.error('❌ Invalid review ID for deletion:', reviewId);
            throw new Error('Invalid review ID');
        }
        return this.http.delete(`${this.apiUrl}/${reviewId}`, {
            headers: this.getHeaders()
        });
    }
}